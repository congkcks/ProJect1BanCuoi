import { Bell, Search, User, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = ((): string => {
    if (!user || typeof user !== 'object') return 'Admin';
    const nameKeys = ['hoTen','HoTen','fullName','name','username'];
    for (const k of nameKeys) {
      const val = (user as any)[k];
      if (typeof val === 'string' && val.trim()) return val.trim();
    }
    return 'Admin';
  })();

  const roleValue = ((): string => {
    if (!user || typeof user !== 'object') return 'Admin';
    const roleKeys = ['vaiTro','vai_tro','role','Role','VaiTro'];
    for (const k of roleKeys) {
      const val = (user as any)[k];
      if (typeof val === 'string' && val.trim()) return val.trim();
    }
    return 'Admin';
  })();

  const initials = ((): string => {
    const src = displayName;
    const parts = src.split(/\s+/).filter(Boolean).slice(0,2);
    return parts.map(p=>p[0]?.toUpperCase()).join('') || 'AD';
  })();

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b bg-background px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">UTC TOEIC Admin Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Tìm kiếm..." className="pl-10" />
        </div>

        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{roleValue}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              Trang chủ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleProfile}>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}