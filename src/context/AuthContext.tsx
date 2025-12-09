import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiService, AuthLoginResponse } from "@/services/api";

export interface AuthUser {
  [key: string]: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthLoginResponse>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ user: AuthUser; persisted: boolean }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword?: string) => Promise<any>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  // Decode base64url JWT payload safely
  const decodeJwtPayload = useCallback((jwt?: string): any | null => {
    if (!jwt) return null;
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) return null;
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      // atob returns a Latin1 string; convert to proper UTF-8 so tiếng Việt giữ nguyên dấu
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const utf8 = new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(utf8);
    } catch {
      return null;
    }
  }, []);

  // Map common .NET JWT claim keys to our user shape
  const synthesizeUserFromClaims = useCallback((claims: any): AuthUser | null => {
    if (!claims || typeof claims !== 'object') return null;
    // Typical .NET claim keys
    const k = {
      nameId: claims['nameid'] || claims['sub'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || claims['MaNd'] || claims['maNd'],
      email: claims['email'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      name: claims['HoTen'] || claims['hoTen'] || claims['name'] || claims['unique_name'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: claims['VaiTro'] || claims['vaiTro'] || claims['role'] || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      avatar: claims['AnhDaiDien'] || claims['anhDaiDien'] || claims['avatar']
    };
    const synthesized: AuthUser = {
      maNd: k.nameId ?? null,
      MaNd: k.nameId ?? null,
      email: k.email ?? null,
      hoTen: k.name ?? null,
      HoTen: k.name ?? null,
      vaiTro: k.role ?? null,
      VaiTro: k.role ?? null,
      anhDaiDien: k.avatar ?? null,
      AnhDaiDien: k.avatar ?? null,
      // raw claims for debugging
      _claims: claims,
    };
    // Require at least an identifier or email to consider valid
    if (!synthesized.maNd && !synthesized.email) return null;
    return synthesized;
  }, []);

  const clearSession = useCallback(() => {
    apiService.logout();
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async (options?: { suppressUnauthorized?: boolean }) => {
    try {
      if (!localStorage.getItem("authToken")) return null;
      const remote = await apiService.getProfile();
      const remoteUser = (remote?.user as any) ?? remote; // backend may wrap under { user }
      if (remoteUser && typeof remoteUser === 'object') {
        setUser(remoteUser);
        localStorage.setItem("currentUser", JSON.stringify(remoteUser));
      }
      return remoteUser;
    } catch (err) {
      const maybeError = err as any;
      // Do not clear session on profile 401 immediately; backend may not support one of the probe endpoints.
      if (!options?.suppressUnauthorized && (maybeError?.status === 401 || maybeError?.status === 403)) {
        console.debug('[Auth] profile fetch unauthorized, preserving session');
      }
      // Fallback: synthesize user from JWT claims so UI can proceed
      const stored = (localStorage.getItem('authToken') || '').replace(/^"+|"+$/g, '').trim();
      const claims = decodeJwtPayload(stored);
      const synthetic = synthesizeUserFromClaims(claims);
      if (synthetic) {
        setUser(synthetic);
        localStorage.setItem('currentUser', JSON.stringify(synthetic));
        console.debug('[Auth] using synthetic user from JWT claims');
        return synthetic;
      }
      // Swallow: we can still use cached user
      return null;
    }
  }, [clearSession, decodeJwtPayload, synthesizeUserFromClaims]);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = getStoredUser();
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(storedUser);
    }
    // Try to hydrate from backend when token exists
    (async () => {
      if (storedToken) await refreshProfile();
      setLoading(false);
    })();
  }, [refreshProfile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUnauthorized = () => {
      clearSession();
    };
    window.addEventListener("api:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("api:unauthorized", handleUnauthorized);
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.authLogin(email, password);
      const nextToken = response.token;
      const cleaned = String(nextToken || '').replace(/^"+|"+$/g, '').trim();
      setToken(cleaned);
      localStorage.setItem('authToken', cleaned);
      // Debug decode minimal JWT header/payload if available
      try {
        const payload = decodeJwtPayload(cleaned);
        if (payload) console.debug('[Auth] JWT payload', payload);
      } catch {}
      // Immediately fetch canonical profile from backend (non-blocking)
      const fetched = await refreshProfile({ suppressUnauthorized: true });
      const nextUser = fetched ?? response.user ?? (() => {
        const claims = decodeJwtPayload(cleaned);
        return synthesizeUserFromClaims(claims) ?? getStoredUser();
      })();
      setUser(nextUser ?? null);
      return {
        ...response,
        user: nextUser ?? response.user,
      };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile, decodeJwtPayload, synthesizeUserFromClaims]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmPassword?: string) => {
      return apiService.changePassword(currentPassword, newPassword, confirmPassword);
    },
    [],
  );

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      const baseUser: AuthUser = { ...(user ?? {}) };
      try {
        const response = await apiService.updateProfile(updates);
        const remoteUser =
          (response?.user as AuthUser | undefined) ??
          (response?.data as AuthUser | undefined) ??
          (response as AuthUser | undefined);
        // If API didn't echo updated user, try to fetch fresh profile
        const ensuredRemote = remoteUser ?? (await (async () => {
          try { return await apiService.getProfile(); } catch { return undefined; }
        })());
        const nextUser: AuthUser = { ...baseUser, ...updates, ...(ensuredRemote ?? {}) };
        setUser(nextUser);
        localStorage.setItem("currentUser", JSON.stringify(nextUser));
        return { user: nextUser, persisted: true };
      } catch (error) {
        console.warn("Profile update failed, falling back to local persistence.", error);
        const fallbackUser: AuthUser = { ...baseUser, ...updates };
        setUser(fallbackUser);
        localStorage.setItem("currentUser", JSON.stringify(fallbackUser));
        return { user: fallbackUser, persisted: false };
      }
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: Boolean(token),
  }), [user, token, loading, login, logout, updateProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
