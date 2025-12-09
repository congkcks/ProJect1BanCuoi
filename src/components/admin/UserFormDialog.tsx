import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminUser, apiService } from "@/services/api";

const userSchema = z
  .object({
    hoTen: z.string().min(2, "Ho ten phai co it nhat 2 ky tu."),
    email: z.string().email("Email khong hop le."),
    vaiTro: z.enum(["User", "Admin"]).default("User"),
    soDienThoai: z.string().optional(),
    matKhau: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.soDienThoai && data.soDienThoai.trim().length > 0 && data.soDienThoai.trim().length < 8) {
      ctx.addIssue({
        path: ["soDienThoai"],
        code: z.ZodIssueCode.custom,
        message: "So dien thoai phai co it nhat 8 ky tu.",
      });
    }
    if (data.matKhau && data.matKhau.trim().length > 0 && data.matKhau.trim().length < 6) {
      ctx.addIssue({
        path: ["matKhau"],
        code: z.ZodIssueCode.custom,
        message: "Mat khau phai co it nhat 6 ky tu.",
      });
    }
  });

export type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSubmit: (data: UserFormValues, isEditing: boolean) => Promise<void> | void;
}

const normalizeRole = (role?: string | null): "User" | "Admin" => {
  if (!role) return "User";
  return role.trim().toLowerCase() === "admin" ? "Admin" : "User";
};

export function UserFormDialog({ open, onOpenChange, user, onSubmit }: UserFormDialogProps) {
  const isEditing = useMemo(() => Boolean(user), [user]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestedId, setSuggestedId] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [fetchingId, setFetchingId] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      hoTen: "",
      email: "",
      vaiTro: "User",
      soDienThoai: "",
      matKhau: "",
    },
  });
  const roleValue = form.watch("vaiTro");

  useEffect(() => {
    if (!open) {
      form.reset({
        hoTen: "",
        email: "",
        vaiTro: "User",
        soDienThoai: "",
        matKhau: "",
      });
      setFormError(null);
      setSuggestedId(null);
      setIdError(null);
      setFetchingId(false);
      return;
    }

    const nextValues: UserFormValues = {
      hoTen: user?.hoTen ?? "",
      email: user?.email ?? "",
      vaiTro: normalizeRole(user?.vaiTro),
      soDienThoai: user?.soDienThoai ?? "",
      matKhau: "",
    };
    form.reset(nextValues);
    setFormError(null);
  }, [open, user, form]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditing) {
      setSuggestedId(user?.maNd ?? null);
      setIdError(null);
      setFetchingId(false);
      return;
    }

    let active = true;
    const normalizedRole = (roleValue as "User" | "Admin") || "User";
    setFetchingId(true);
    setIdError(null);

    apiService
      .adminGetNextUserId(normalizedRole)
      .then((nextId) => {
        if (!active) return;
        setSuggestedId(nextId);
      })
      .catch((error: any) => {
        if (!active) return;
        setSuggestedId(null);
        setIdError(error?.message || "Khong the tao ma nguoi dung.");
      })
      .finally(() => {
        if (!active) return;
        setFetchingId(false);
      });

    return () => {
      active = false;
    };
  }, [open, isEditing, user, roleValue]);

  const handleSubmit = async (values: UserFormValues) => {
    if (!isEditing && (!values.matKhau || values.matKhau.trim().length === 0)) {
      form.setError("matKhau", { type: "manual", message: "Mat khau la bat buoc khi tao nguoi dung moi." });
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(values, isEditing);
      onOpenChange(false);
    } catch (error: any) {
      setFormError(error?.message || "Khong the luu nguoi dung. Vui long thu lai.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chinh sua nguoi dung" : "Them nguoi dung moi"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FormLabel>Ma nguoi dung</FormLabel>
                <Input
                  value={suggestedId ?? ""}
                  readOnly
                  className="font-mono"
                  placeholder="Dang tao ma..."
                />
                <p className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Ma nguoi dung khong the thay doi."
                    : idError
                      ? idError
                      : fetchingId
                        ? "Dang tao ma tu dong..."
                        : "Ma se tu dong theo dinh dang ND + so tang dan."}
                </p>
              </div>

              <FormField
                control={form.control}
                name="hoTen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ho ten</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhap ho ten" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhap email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="vaiTro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai tro</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chon vai tro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soDienThoai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>So dien thoai</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhap so dien thoai (neu co)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="matKhau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Mat khau moi (bo trong neu giu nguyen)" : "Mat khau"}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhap mat khau" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Huy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Dang luu...
                  </>
                ) : (
                  isEditing ? "Cap nhat" : "Tao moi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

