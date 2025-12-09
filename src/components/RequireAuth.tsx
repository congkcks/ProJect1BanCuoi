import { ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
  redirectTo?: string;
  forbiddenRedirect?: string;
}

const resolveRole = (user: Record<string, unknown> | null | undefined): string | null => {
  if (!user || typeof user !== "object") return null;
  const candidates = ["vai_tro", "vaiTro", "VaiTro", "role", "Role"];
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(user, key)) {
      const value = (user as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return null;
};

const RequireAuth = ({
  children,
  roles,
  redirectTo = "/login",
  forbiddenRedirect = "/",
}: RequireAuthProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  const normalizedRole = useMemo(() => {
    const role = resolveRole(user);
    return role ? role.toLowerCase() : null;
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Dang tai...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const allowed = roles.some((role) => role.toLowerCase() === normalizedRole);
    if (!allowed) {
      // If a non-admin user tries to access /dashboard when dashboard is intended for authenticated general users
      // we still allow it (assuming dashboard is common). Only block strictly admin-only areas.
      const attemptingDashboard = location.pathname.toLowerCase().startsWith('/dashboard');
      if (attemptingDashboard && !roles.includes('Admin')) {
        // Allow fallback to dashboard for regular users without role check interference
        return <>{children}</>;
      }
      return <Navigate to={forbiddenRedirect} replace />;
    }
  }

  return <>{children}</>;
};

export default RequireAuth;

