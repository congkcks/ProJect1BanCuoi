import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AuthTab = "login" | "register";

interface AuthPageProps {
  initialTab: AuthTab;
}

const resolveRole = (user: any): string | null => {
  if (!user || typeof user !== "object") return null;
  const candidate = [user?.vai_tro, user?.VaiTro, user?.role, user?.Role].find(
    (item) => typeof item === "string" && item.trim().length > 0
  );
  return candidate ? (candidate as string).trim().toLowerCase() : null;
};

const AuthPage = ({ initialTab }: AuthPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setLoginError(null);
    setRegisterError(null);
    setRegisterSuccess(null);
  }, [initialTab]);

  const handleTabChange = (value: string) => {
    const nextTab: AuthTab = value === "register" ? "register" : "login";
    setActiveTab(nextTab);
    setLoginError(null);
    setRegisterError(null);
    setRegisterSuccess(null);
    navigate(nextTab === "login" ? "/login" : "/register", { replace: true, state: location.state });
  };

  const canSubmitLogin = useMemo(
    () => loginEmail.trim().length > 0 && loginPassword.trim().length > 0,
    [loginEmail, loginPassword]
  );

  const canSubmitRegister = useMemo(
    () =>
      registerName.trim().length > 0 &&
      registerEmail.trim().length > 0 &&
      registerPassword.trim().length > 0,
    [registerName, registerEmail, registerPassword]
  );

  const resolveRedirect = (role: string | null) => {
    // Admin đi thẳng vào trang quản trị
    if (role === "admin") return "/admin";
    // Không cho người dùng thường quay lại các trang bị hạn chế như /admin hoặc /dashboard
    const state = location.state as { from?: { pathname?: string } } | null;
    const fromPath = state?.from?.pathname;
    if (fromPath && fromPath !== "/login" && fromPath !== "/register") {
      const lower = fromPath.toLowerCase();
      if (lower.startsWith("/admin") || lower === "/dashboard") {
        return "/"; // về trang chủ an toàn
      }
      return fromPath;
    }
    // Mặc định: người dùng thường về trang chủ
    return "/";
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitLogin || loginLoading) return;

    setLoginError(null);
    setLoginLoading(true);
    try {
      const response = await login(loginEmail.trim(), loginPassword.trim());
      // Role may not be immediately available if profile endpoints are unauthorized; fallback to dashboard
      const role = resolveRole(response?.user);
      const target = resolveRedirect(role);
      navigate(target, { replace: true });
    } catch (error: any) {
  setLoginError(error?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoginLoading(false);
    }
  };

  const authenticatedRole = resolveRole(user);
  const authenticatedRedirect = resolveRedirect(authenticatedRole);

  // If authenticated and already on /login or /register, force redirect (defensive)
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to={authenticatedRedirect} replace />;
  }

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitRegister || registerLoading) return;

    setRegisterError(null);
    setRegisterSuccess(null);
    setRegisterLoading(true);
    try {
      await apiService.authRegister({
        hoTen: registerName.trim(),
        email: registerEmail.trim(),
        matKhau: registerPassword.trim(),
      });
  setRegisterSuccess("Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.");
      setActiveTab("login");
      navigate("/login", { replace: true, state: location.state });
      setLoginEmail(registerEmail.trim());
      setRegisterPassword("");
    } catch (error: any) {
  setRegisterError(error?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl flex-col items-center justify-center">
        <div className="w-full space-y-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-hero">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-toeic-navy">UTC TOEIC</h1>
              <p className="text-sm text-muted-foreground">Nền tảng học TOEIC thông minh</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList
              className={cn(
                "mx-auto mb-6 grid h-auto w-full max-w-md grid-cols-2 rounded-full bg-muted p-1",
                "border border-border/60"
              )}
            >
              <TabsTrigger
                value="login"
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-semibold transition",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm"
                )}
              >
                Đăng nhập
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-semibold transition",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm"
                )}
              >
                Đăng ký
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border border-border/60 shadow-md">
                <CardHeader className="space-y-1 text-left">
                  <CardTitle className="text-2xl font-semibold">Đăng nhập</CardTitle>
                  <CardDescription>Đăng nhập để tiếp tục học tập</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                    {loginError && (
                      <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {loginError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="login-email">
                        Email
                      </label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="login-password">
                        Mật khẩu
                      </label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="********"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loginLoading || !canSubmitLogin}>
                      {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border border-border/60 shadow-md">
                <CardHeader className="space-y-1 text-left">
                  <CardTitle className="text-2xl font-semibold">Đăng ký tài khoản</CardTitle>
                  <CardDescription>Tạo tài khoản miễn phí để bắt đầu</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                    {registerError && (
                      <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {registerError}
                      </div>
                    )}
                    {registerSuccess && (
                      <div className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
                        {registerSuccess}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="register-name">
                        Họ và tên
                      </label>
                      <Input
                        id="register-name"
                        placeholder="Nguyen Van A"
                        value={registerName}
                        onChange={(event) => setRegisterName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="register-email">
                        Email
                      </label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="register-password">
                        Mật khẩu
                      </label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="********"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={registerLoading || !canSubmitRegister}>
                      {registerLoading ? "Đang đăng ký..." : "Đăng ký ngay"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
