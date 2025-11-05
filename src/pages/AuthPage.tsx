import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const AuthPage = ({ initialTab }: AuthPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setLoginError(null);
    setRegisterError(null);
    setRegisterSuccess(null);
  }, [initialTab]);

  const handleTabChange = (value: string) => {
    const nextValue = value === "register" ? "register" : "login";
    setActiveTab(nextValue);
    setLoginError(null);
    setRegisterError(null);
    setRegisterSuccess(null);
    navigate(nextValue === "login" ? "/login" : "/register", { replace: true, state: location.state });
  };

  const canSubmitLogin = useMemo(
    () => Boolean(loginEmail.trim()) && Boolean(loginPassword.trim()),
    [loginEmail, loginPassword]
  );

  const canSubmitRegister = useMemo(
    () =>
      Boolean(registerName.trim()) &&
      Boolean(registerEmail.trim()) &&
      Boolean(registerPassword.trim()),
    [registerName, registerEmail, registerPassword]
  );

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitLogin || loginLoading) return;

    setLoginError(null);
    setLoginLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword.trim());
      const redirectTo = (location.state as any)?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      setLoginError(error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoginLoading(false);
    }
  };

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
      setRegisterSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
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
              <h1 className="text-3xl font-bold text-toeic-navy">TOEIC ACE PATH</h1>
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
                  <CardDescription>Nhập thông tin để tiếp tục học tập</CardDescription>
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
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginLoading || !canSubmitLogin}
                    >
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
                        placeholder="Nguyễn Văn A"
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
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerLoading || !canSubmitRegister}
                    >
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
