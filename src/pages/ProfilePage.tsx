import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import avatarPlaceholder from "@/assets/default-avatar.svg";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, Target, Trophy } from "lucide-react";

const getUserFullName = (source: any): string =>
  (source?.hoTen as string) ||
  (source?.fullName as string) ||
  (source?.name as string) ||
  "Người dùng";

const getUserEmail = (source: any): string =>
  (source?.email as string) || "user@example.com";

const getUserPhone = (source: any): string =>
  (source?.soDienThoai as string) ||
  (source?.phone as string) ||
  (source?.so_tel as string) ||
  "";

const getUserAvatar = (source: any): string =>
  (source?.anhDaiDien as string) ||
  (source?.avatarUrl as string) ||
  (source?.avatar as string) ||
  "";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: getUserFullName(user),
    email: getUserEmail(user),
    phone: getUserPhone(user),
  });
  const [avatarPath, setAvatarPath] = useState<string>(getUserAvatar(user));
  const [avatarPreview, setAvatarPreview] = useState<string>(
    getUserAvatar(user) || avatarPlaceholder
  );

  const resetForm = useCallback(() => {
    const nextFullName = getUserFullName(user);
    const nextEmail = getUserEmail(user);
    const nextPhone = getUserPhone(user);
    const nextAvatar = getUserAvatar(user);

    setFormValues({ fullName: nextFullName, email: nextEmail, phone: nextPhone });
    setAvatarPath(nextAvatar);

    const shouldKeepObjectUrl =
      Boolean(objectUrlRef.current) && Boolean(nextAvatar) && nextAvatar.startsWith("/uploads/");

    if (shouldKeepObjectUrl && objectUrlRef.current) {
      setAvatarPreview(objectUrlRef.current);
    } else {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAvatarPreview(nextAvatar || avatarPlaceholder);
    }
  }, [user]);

  useEffect(() => {
    resetForm();
    setIsEditing(false);
  }, [resetForm]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    []
  );

  const initials = useMemo(() => {
    const segments = formValues.fullName.trim().split(/\s+/).filter(Boolean);
    if (!segments.length) return "ND";
    if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
    return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
  }, [formValues.fullName]);

  const studyHistory = useMemo(
    () => [
      { date: "Hôm nay", activity: "Hoàn thành bài Reading Part 5", time: "30 phút" },
      { date: "Hôm qua", activity: "Luyện Listening Part 1-2", time: "45 phút" },
      { date: "2 ngày trước", activity: "Mini Test 1", time: "60 phút" },
      { date: "3 ngày trước", activity: "Học từ vựng Business", time: "25 phút" },
    ],
    []
  );

  const handleInputChange =
    (field: "fullName" | "email" | "phone") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!isEditing) return;
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleEditToggle = () => {
    if (isSaving) return;
    if (isEditing) {
      resetForm();
    }
    setIsEditing((prev) => !prev);
  };

  const handleAvatarButtonClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tập tin không hợp lệ",
        description: "Vui lòng chọn ảnh (định dạng png, jpg, jpeg, ...).",
        variant: "destructive",
      });
      return;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setAvatarPreview(localUrl);
    setAvatarPath(`/uploads/${file.name}`);
  };

  const handleSave = async () => {
    if (isSaving || !isEditing) return;
    setIsSaving(true);
    try {
      const identifiers = {
        maNguoiDung:
          (user as any)?.maNguoiDung ??
          (user as any)?.maNguoiDung ??
          (user as any)?.ma_nd ??
          (user as any)?.maND ??
          (user as any)?.id ??
          (user as any)?.userId ??
          null,
      };

      const payload = {
        hoTen: formValues.fullName,
        fullName: formValues.fullName,
        name: formValues.fullName,
        email: formValues.email,
        soDienThoai: formValues.phone,
        phone: formValues.phone,
        anhDaiDien: avatarPath,
        avatarUrl: avatarPath,
        avatar: avatarPath,
        ...(identifiers.maNguoiDung && {
          maNguoiDung: identifiers.maNguoiDung,
          maND: identifiers.maNguoiDung,
          ma_nd: identifiers.maNguoiDung,
          id: identifiers.maNguoiDung,
          userId: identifiers.maNguoiDung,
        }),
      };

      const result = await updateProfile(payload);
      setIsEditing(false);
      toast({
        title: "Đã lưu thay đổi",
        description: result.persisted
          ? "Thông tin của bạn đã được cập nhật thành công."
          : "Không thể kết nối máy chủ, dữ liệu đã được lưu tạm trên trình duyệt.",
        variant: result.persisted ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Lưu thay đổi thất bại",
        description: error?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold">Hồ sơ cá nhân</h1>

          <div className="mb-6 grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="mb-4 h-32 w-32">
                  <AvatarImage src={avatarPreview} alt={formValues.fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-2xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={!isEditing}
                />
                <Button variant="outline" size="sm" onClick={handleAvatarButtonClick} disabled={!isEditing}>
                  Đổi ảnh
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>Cập nhật thông tin của bạn</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>
                    {isEditing ? "Huỷ" : "Sửa"}
                  </Button>
                  <Button onClick={handleSave} disabled={!isEditing || isSaving}>
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={formValues.fullName}
                    onChange={handleInputChange("fullName")}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange("email")}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formValues.phone}
                    onChange={handleInputChange("phone")}
                    placeholder="0912345678"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mục tiêu học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Điểm mục tiêu</span>
                  <Badge className="text-lg">750+</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thời hạn</span>
                  <Badge variant="secondary">3 tháng</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lộ trình</span>
                  <Badge className="border-sky-200 bg-sky-100 text-sky-700" variant="outline">
                    Intensive
                  </Badge>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Điều chỉnh mục tiêu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Thành tích
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-success to-success/70">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">7 ngày liên tiếp</div>
                      <div className="text-sm text-muted-foreground">Streak hiện tại</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-warning to-warning/70">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">45 giờ</div>
                      <div className="text-sm text-muted-foreground">Tổng thời gian học</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch sử học tập
              </CardTitle>
              <CardDescription>Hoạt động học tập gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studyHistory.map((item, index) => (
                  <div
                    key={`history-${index}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <div className="font-medium">{item.activity}</div>
                        <div className="text-sm text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{item.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
