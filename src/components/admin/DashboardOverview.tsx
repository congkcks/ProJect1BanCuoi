import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiService, AdminDashboardOverview as AdminDashboardMetrics } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const recentActivities = [
  { user: "Nguyễn Văn A", action: "Hoàn thành bài test A2", time: "5 phút trước" },
  { user: "Trần Thị B", action: "Đăng ký khóa học B1", time: "15 phút trước" },
  { user: "Lê Văn C", action: "Đạt 850 điểm TOEIC", time: "30 phút trước" },
  { user: "Phạm Thị D", action: "Hoàn thành lộ trình 25 ngày", time: "1 giờ trước" },
];

export function DashboardOverview() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    apiService
      .getAdminDashboardOverview()
      .then((data) => {
        if (!mounted) return;
        setMetrics(data);
      })
      .catch((err: any) => {
        if (!mounted) return;
        const message = err?.message || "Khong the tai thong ke Dashboard.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Loi tai thong ke",
          description: message,
        });
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return value.toLocaleString("vi-VN");
  };

  const lessonDistribution = useMemo(() => {
    const listening = metrics?.listeningLessons ?? 0;
    const reading = metrics?.readingLessons ?? 0;
    const writing = metrics?.writingLessons ?? 0;
    const total = Math.max(1, listening + reading + writing);
    return [
      {
        label: "Bài nghe",
        value: listening,
        percent: Math.round((listening / total) * 100),
      },
      {
        label: "Bài đọc",
        value: reading,
        percent: Math.round((reading / total) * 100),
      },
      {
        label: "Bài viết",
        value: writing,
        percent: Math.round((writing / total) * 100),
      },
    ];
  }, [metrics]);

  const lastUpdatedText = useMemo(() => {
    if (!metrics?.lastUpdated) return null;
    try {
      return new Date(metrics.lastUpdated).toLocaleString("vi-VN");
    } catch {
      return metrics.lastUpdated;
    }
  }, [metrics]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan Dashboard</h2>
        <p className="text-muted-foreground">Thống kê tổng quan hệ thống TOEIC</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Đang tải..." : formatNumber(metrics?.totalUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {error ? error : lastUpdatedText ? `Cập nhật: ${lastUpdatedText}` : "Số lượng tài khoản đã đăng ký"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài học đã tạo</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Đang tải..." : formatNumber(metrics?.totalLessons)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Đang thống kê theo kỹ năng..."
                : `Nghe ${formatNumber(metrics?.listeningLessons)} · Đọc ${formatNumber(metrics?.readingLessons)} · Viết ${formatNumber(metrics?.writingLessons)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Phân bổ loại bài học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessonDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span>
                    {loading ? "—" : `${formatNumber(item.value)} bài (${item.percent}%)`}
                  </span>
                </div>
                <Progress value={loading ? 0 : item.percent} />
              </div>
            ))}
            {!loading && metrics?.totalLessons === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có bài học nào được tạo.</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}