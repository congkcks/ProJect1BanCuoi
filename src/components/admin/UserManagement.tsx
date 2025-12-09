import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  MoreHorizontal,
  Search,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import { apiService, AdminUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserFormDialog, UserFormValues } from "./UserFormDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface UserDialogState {
  open: boolean;
  user: AdminUser | null;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return value;
  }
};

const getInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ND";
};

const matchesSearch = (user: AdminUser, keyword: string) => {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return true;
  return (
    user.hoTen.toLowerCase().includes(normalized) ||
    user.email.toLowerCase().includes(normalized) ||
    user.maNd.toLowerCase().includes(normalized) ||
    (user.soDienThoai ?? "").toLowerCase().includes(normalized) ||
    (user.matKhau ?? "").toLowerCase().includes(normalized)
  );
};

export function UserManagement() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [userDialog, setUserDialog] = useState<UserDialogState>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<UserDialogState>({ open: false, user: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchUsers = useCallback(async (keyword?: string) => {
    const normalized = keyword && keyword.trim().length > 0 ? keyword.trim() : undefined;
    return apiService.adminListUsers(normalized);
  }, []);

  const handleFetchError = useCallback((error: unknown) => {
    console.error("Failed to fetch users", error);
    let message: string;
    if (error && typeof error === 'object' && 'status' in (error as any)) {
      const status = (error as any).status;
      if (status === 401 || status === 403) {
        message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
        logout();
      } else {
        message = (error as any).message || 'Không thể tải danh sách người dùng.';
      }
    } else {
      message = error instanceof Error ? error.message : 'Không thể tải danh sách người dùng. Vui lòng thử lại.';
    }
    toast({
      variant: "destructive",
      title: "Lỗi tải danh sách",
      description: message,
    });
  }, [toast, logout]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    const keyword = searchTerm.trim();
    const timer = window.setTimeout(() => {
      fetchUsers(keyword)
        .then(({ users: fetchedUsers, total }) => {
          if (requestIdRef.current !== requestId) return;
          setUsers(fetchedUsers);
          setTotalUsers(total);
        })
        .catch((error) => {
          if (requestIdRef.current !== requestId) return;
          handleFetchError(error);
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setLoading(false);
          }
        });
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchUsers, handleFetchError, searchTerm, refreshToken]);

  const displayedUsers = useMemo(() => {
    const keyword = searchTerm.trim();
    if (!keyword) return users;
    return users.filter((user) => matchesSearch(user, keyword));
  }, [users, searchTerm]);

  const handleCreateUser = () => {
    setUserDialog({ open: true, user: null });
  };

  const handleEditUser = (user: AdminUser) => {
    setUserDialog({ open: true, user });
  };

  const handleDeleteUser = (user: AdminUser) => {
    setDeleteDialog({ open: true, user });
  };

  const handleUserSubmit = async (formValues: UserFormValues, isEditing: boolean) => {
    const trimmedPhone = formValues.soDienThoai?.trim();
    try {
      if (isEditing && userDialog.user) {
        const targetId = userDialog.user.maNd;
        await apiService.adminUpdateUser(targetId, {
          hoTen: formValues.hoTen.trim(),
          email: formValues.email.trim(),
          vaiTro: formValues.vaiTro,
          soDienThoai: trimmedPhone === "" ? null : trimmedPhone,
          ...(formValues.matKhau ? { matKhau: formValues.matKhau.trim() } : {}),
        });
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật người dùng ${formValues.hoTen}.`,
        });
      } else {
        await apiService.adminCreateUser({
          hoTen: formValues.hoTen.trim(),
          email: formValues.email.trim(),
          matKhau: (formValues.matKhau ?? "").trim(),
          vaiTro: formValues.vaiTro,
          soDienThoai: trimmedPhone && trimmedPhone.length > 0 ? trimmedPhone : undefined,
        });
            toast({
              title: "Tạo người dùng thành công",
              description: `Đã thêm người dùng ${formValues.hoTen}.`,
            });
      }
      setLoading(true);
      setRefreshToken((token) => token + 1);
    } catch (error: any) {
      const message = error?.message || "Không thể lưu người dùng. Vui lòng thử lại.";
      toast({
        variant: "destructive",
        title: "Lỗi lưu người dùng",
        description: message,
      });
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;
    const targetId = deleteDialog.user.maNd;
    try {
      setDeletingId(targetId);
      await apiService.adminDeleteUser(targetId);
      toast({
        title: "Xóa thành công",
        description: `Đã xóa tài khoản ${deleteDialog.user.hoTen}.`,
      });
      setLoading(true);
      setRefreshToken((token) => token + 1);
    } catch (error: any) {
      const message = error?.message || "Không thể xóa người dùng. Vui lòng thử lại.";
      toast({
        variant: "destructive",
        title: "Lỗi xóa người dùng",
        description: message,
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tài khoản của học viên và quản trị viên.
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Danh sách người dùng</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-72 pl-10"
                />
              </div>
              <Badge variant="outline" className="font-normal">
                Tổng số: {totalUsers}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã người dùng</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mật khẩu</TableHead>
                  <TableHead>Ảnh đại diện</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell colSpan={10}>
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tải dữ liệu...
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : displayedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-6 text-center text-muted-foreground">
                      {searchTerm.trim().length > 0 ? 'Không có người dùng nào phù hợp với từ khóa.' : 'Chưa có dữ liệu người dùng hoặc bạn không có quyền.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedUsers.map((user) => (
                    <TableRow key={user.maNd}>
                      <TableCell className="font-mono">{user.maNd}</TableCell>
                      <TableCell>{user.hoTen}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="font-mono text-xs break-all">
                        {user.matKhau || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {user.anhDaiDien ? (
                              <AvatarImage src={user.anhDaiDien} alt={user.hoTen} />
                            ) : null}
                            <AvatarFallback>{getInitials(user.hoTen)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {user.anhDaiDien || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.vaiTro?.toLowerCase() === "admin" ? "default" : "secondary"}>
                          {user.vaiTro ?? "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.soDienThoai || "—"}</TableCell>
                      <TableCell>{formatDateTime(user.ngayDangKy)}</TableCell>
                      <TableCell>{formatDateTime(user.lanDangNhapCuoi)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingId === user.maNd}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa người dùng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserFormDialog
        open={userDialog.open}
        onOpenChange={(open) => setUserDialog({ open, user: open ? userDialog.user : null })}
        user={userDialog.user}
        onSubmit={handleUserSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: open ? deleteDialog.user : null })}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa tài khoản "${deleteDialog.user?.hoTen}"?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
