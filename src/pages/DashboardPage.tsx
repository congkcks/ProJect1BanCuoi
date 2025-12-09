// Canonical Dashboard page.
// NOTE: Duplicates functionality with src/components/Dashboard.tsx (legacy, simplified).
// Use this page for routing (/dashboard). Consider removing the legacy component after migration.
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserProgressDashboard from "@/components/UserProgressDashboard";
import PersonalProgressList from "@/components/PersonalProgressList";
import LearningPlanView from "@/components/LearningPlanView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiService, DashboardStats, Badge as UserBadge, LearningPlan } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Flame, Target, BookOpen, Clock, Award, TrendingUp, Calendar } from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [todayPlan, setTodayPlan] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return; // không gọi API nếu chưa đăng nhập
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const userId = apiService.getCurrentUserId();
        const [dashboardStats, userBadges, plan] = await Promise.all([
          apiService.getDashboardStats(userId),
          apiService.getUserBadges(userId),
          apiService.getLearningPlan(userId)
        ]);
        if (cancelled) return;
        setStats(dashboardStats);
        setBadges(userBadges);
        setTodayPlan(plan);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Không thể tải dữ liệu dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const completionRate = stats && stats.totalExercises > 0
    ? Math.round((stats.completedExercises / stats.totalExercises) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 max-w-7xl py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-toeic-navy">Bảng điều khiển học tập</h1>
          <p className="text-muted-foreground text-sm md:text-base">Theo dõi tiến độ, mục tiêu và lộ trình học TOEIC của bạn</p>
        </div>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-destructive text-sm">{error === 'API Error: 401' ? 'Bạn không có quyền truy cập dữ liệu Dashboard (401).' : error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
              >Thử lại</button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Chuỗi ngày học</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streakDays}</div>
                <p className="text-xs text-muted-foreground">ngày liên tiếp</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Điểm ước tính</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalScore}</div>
                <p className="text-xs text-muted-foreground">TOEIC dự đoán</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành bài học</CardTitle>
                <BookOpen className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedExercises}/{stats.totalExercises}</div>
                <p className="text-xs text-muted-foreground">{completionRate}% hoàn thành</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Giờ học</CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studyHours}</div>
                <p className="text-xs text-muted-foreground">tổng cộng</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4" /> Tiến độ theo kỹ năng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[{label:'Listening (Nghe)', value: stats.progress.listening},
                  {label:'Reading (Đọc)', value: stats.progress.reading},
                  {label:'Writing (Viết)', value: stats.progress.writing},
                  {label:'Speaking (Nói)', value: stats.progress.speaking}].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1"><span>{item.label}</span><span>{item.value}%</span></div>
                    <Progress value={item.value} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4" /> Kết quả gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.recentResults.length === 0 && (
                  <p className="text-xs text-muted-foreground">Chưa có kết quả gần đây.</p>
                )}
                {stats.recentResults.map((r,i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span>{r.exercise}</span>
                    <Badge variant={r.score >= 80 ? 'default' : 'secondary'}>{r.score} điểm</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !error && badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Award className="h-4 w-4" /> Huy hiệu đạt được ({badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <Badge key={b.badgeId} variant="outline" className="text-xs px-2 py-1 flex items-center gap-1">
                    <Award className="h-3 w-3" /> {b.badgeName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed detail sections reusing existing components */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
            <TabsTrigger value="overview">Tổng quan chi tiết</TabsTrigger>
            <TabsTrigger value="plan">Kế hoạch hôm nay</TabsTrigger>
            <TabsTrigger value="progress">Tiến độ cá nhân</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <UserProgressDashboard />
          </TabsContent>
          <TabsContent value="plan">
            <LearningPlanView />
          </TabsContent>
          <TabsContent value="progress" className="space-y-6">
            <UserProgressDashboard />
            <PersonalProgressList />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;