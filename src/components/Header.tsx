import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import defaultAvatar from "@/assets/default-avatar.svg";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  label: string;
  to: string;
  external?: boolean;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = useMemo(
    (): NavLink[] => [
      { label: "Trang chủ", to: "/" },
      { label: "Đánh giá trình độ", to: "/assessment" },
      { label: "Lộ trình học", to: "/study-plan" },
      { label: "Tiến độ học tập", to: "/dashboard" },
      { label: "Luyện tập 4 kỹ năng", to: "/luyen-tap" },

      // { label: "Tất cả trang", to: "/all-interfaces" },
    ],
    []
  );  // Ưu tiên họ tên có dấu từ claims backend (HoTen/hoTen), fallback các biến thể khác
  const fullName =
    (user?.HoTen as string) ||
    (user?.hoTen as string) ||
    (user?.fullName as string) ||
    (user?.name as string) ||
    "Người dùng";
  const email = (user?.email as string) || "";
  const avatarUrl =
    (user?.anhDaiDien as string) ||
    (user?.avatarUrl as string) ||
    (user?.avatar as string) ||
    "";

  const isAdmin = useMemo(() => {
    const roleCandidate =
      (user?.vai_tro as string) ||
      (user?.VaiTro as string) ||
      (user?.vaiTro as string) ||
      (user?.role as string) ||
      (user?.Role as string);
    if (typeof roleCandidate !== "string") return false;
    const normalized = roleCandidate.trim().toLowerCase();
    return normalized === "admin" || normalized === "administrator";
  }, [user]);

  const initials = useMemo(() => {
    const segments = fullName.trim().split(/\s+/).filter(Boolean);
    if (!segments.length) return "ND";
    if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
    return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
  }, [fullName]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <span className="text-lg font-bold text-white">U</span>
            </div>
            <span className="text-xl font-bold text-toeic-navy">UTC TOEIC</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1 text-foreground transition-colors hover:text-toeic-blue"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          {!isAuthenticated ? (
            <div className="hidden items-center gap-4 md:flex">
              <Button variant="ghost" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/register">Đăng ký miễn phí</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden items-center justify-end md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5 transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={avatarUrl || defaultAvatar} alt={fullName} />
                      <AvatarFallback className="text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{fullName}</span>
                      {email && (
                        <span className="text-xs text-muted-foreground">{email}</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleNavigate("/admin");
                      }}
                    >
                      Dashboard admin
                    </DropdownMenuItem>
                  )}
                  {isAdmin && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      handleNavigate("/profile");
                    }}
                  >
                    Thông tin cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      handleLogout();
                    }}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 space-y-4 pb-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => handleNavigate(link.to)}
                  className="text-left text-foreground transition-colors hover:text-toeic-blue"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            {!isAuthenticated ? (
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/register">Đăng ký miễn phí</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-4">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarUrl || defaultAvatar} alt={fullName} />
                    <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{fullName}</span>
                    {email && (
                      <span className="text-sm text-muted-foreground">{email}</span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Button variant="secondary" onClick={() => handleNavigate("/admin")}>
                    Dashboard admin
                  </Button>
                )}
                <Button variant="ghost" onClick={() => handleNavigate("/profile")}>
                  Thông tin cá nhân
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
