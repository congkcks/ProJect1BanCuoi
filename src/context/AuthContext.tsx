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

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = getStoredUser();
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.authLogin(email, password);
      const nextToken = response.token;
      const nextUser = response.user ?? getStoredUser();
      setToken(nextToken);
      setUser(nextUser ?? null);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      const baseUser: AuthUser = { ...(user ?? {}) };
      try {
        const response = await apiService.updateProfile(updates);
        const remoteUser =
          (response?.user as AuthUser | undefined) ??
          (response?.data as AuthUser | undefined) ??
          (response as AuthUser | undefined);
        const nextUser: AuthUser = { ...baseUser, ...updates, ...(remoteUser ?? {}) };
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
    isAuthenticated: Boolean(token),
  }), [user, token, loading, login, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
