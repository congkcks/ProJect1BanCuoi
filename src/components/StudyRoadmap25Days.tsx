import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Target, 
  Trophy,
  CheckCircle,
  ArrowRight,
  Play,
  Clock,
  Bookmark,
  BookOpen
} from "lucide-react";
import { apiService, type LessonsResponse, type LessonItem, type LoTrinhItem } from "@/services/api";


interface DayData {
  day: number;
  topic: string;
  status: 'completed' | 'current' | 'locked';
  maBai: string;
  moTa?: string | null;
  thoiLuongPhut?: number;
}

interface WeekData {
  week: number;
  title: string;
  days: DayData[];
}

const StudyRoadmap25Days = () => {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [supportsCompletion, setSupportsCompletion] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    fetchRoadmapData();

    // Refetch when login occurs in the same tab
    const onTokenUpdate = () => {
      setAuthNotice(null);
      fetchRoadmapData();
    };
    // If backend marks unauthorized later, we can refetch to fall back gracefully
    const onUnauthorized = () => {
      setAuthNotice('Phiên đăng nhập đã hết hạn. Đang dùng dữ liệu công cộng nếu có. Hãy đăng nhập lại để xem trạng thái cá nhân.');
    };
    window.addEventListener('auth:token-updated', onTokenUpdate);
    window.addEventListener('auth:logged-in', onTokenUpdate);
    window.addEventListener('api:unauthorized', onUnauthorized as EventListener);
    return () => {
      window.removeEventListener('auth:token-updated', onTokenUpdate);
      window.removeEventListener('auth:logged-in', onTokenUpdate);
      window.removeEventListener('api:unauthorized', onUnauthorized as EventListener);
    };
  }, []);

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Lỗi không xác định.';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (err.status) return `HTTP ${err.status}`;
    try { return JSON.stringify(err); } catch { return 'Lỗi không xác định.'; }
  };

  const fetchRoadmapData = async () => {
    try {
      setLoading(true);
      // Determine effective authentication (token or cookie session)
      let lessonsRes: LessonsResponse;
      const tokenAuth = apiService.isAuthenticated();
      const cookieAuth = await apiService.checkSessionAuthenticated().catch(() => false);
      const isAuth = tokenAuth || cookieAuth;
      setIsAuthenticated(isAuth);

      console.log('tokenAuth:', tokenAuth);
      console.log('cookieAuth:', cookieAuth);
      console.log('isAuth:', isAuth);

      

      if (isAuth) {
        // Try authenticated API first to get user-specific completion data
        try {
          lessonsRes = await apiService.getAllLessonsWithContent();
        } catch (eAuth: any) {
          if (eAuth?.status === 401 || eAuth?.status === 403) {
            // If authenticated fails with auth error, try public
            try {
              lessonsRes = await apiService.getAllLessonsWithContentPublic();
            } catch (ePub: any) {
              console.warn('Both authenticated and public lessons failed; using generic lessons.', ePub);
              setAuthNotice('Phiên đăng nhập đã hết hạn. Đang dùng dữ liệu công cộng. Hãy đăng nhập lại để xem trạng thái cá nhân.');
              lessonsRes = await apiService.getLessons();
            }
          } else {
            // Other error with authenticated, try public
            try {
              lessonsRes = await apiService.getAllLessonsWithContentPublic();
            } catch (ePub: any) {
              console.warn('Authenticated failed, public also failed; using generic lessons.', ePub);
              setAuthNotice('Phiên đăng nhập đã hết hạn. Đang dùng dữ liệu công cộng. Hãy đăng nhập lại để xem trạng thái cá nhân.');
              lessonsRes = await apiService.getLessons();
            }
          }
        }
      } else {
        lessonsRes = await apiService.getLessons();
      }
      const roadmapsRes = await apiService.getAvailableRoadmaps();

      const lessons = lessonsRes.data || [];
      // Temporary fix: hardcode BH007 as completed
      // lessons.forEach(l => {
      //   if (l.maBai === 'BH007') {
      //     (l as any).daHoanThanhBaiHoc = true;
      //   }
      // });
      const hasFlagField = lessons.some(l => Object.prototype.hasOwnProperty.call(l as any, 'daHoanThanhBaiHoc'));
      const anyCompletedTrue = lessons.some(l => (l as any)?.daHoanThanhBaiHoc === true);
      const hasCompletion = hasFlagField;

      console.log('Lessons response:', lessonsRes);
      console.log('hasFlagField:', hasFlagField);
      console.log('anyCompletedTrue:', anyCompletedTrue);
      console.log('hasCompletion:', hasCompletion);
      console.log('isAuth:', isAuth);

      // If authenticated but lessons lack completion flags, try progress API to infer completion
      let progressMap: Record<string, boolean> = {};
      if (isAuth && !hasCompletion) {
        try {
          const td = await apiService.getAllTienDo();
          const items = Array.isArray(td?.data) ? td.data : [];
          progressMap = items.reduce((acc: Record<string, boolean>, it: any) => {
            const maBai = it?.maBai || it?.MaBai;
            const percent = typeof it?.phanTramHoanThanh === 'number' ? it.phanTramHoanThanh : (typeof it?.PhanTramHoanThanh === 'number' ? it.PhanTramHoanThanh : 0);
            const statusRaw = (it?.trangThai || it?.TrangThai || '').toString().toLowerCase();
            const done = percent >= 100 || statusRaw.includes('hoàn thành') || statusRaw.includes('hoan thanh') || statusRaw.includes('completed');
            if (maBai) acc[String(maBai)] = !!done;
            return acc;
          }, {});
        } catch (e3: any) {
          if (e3?.status === 401 || e3?.status === 403) {
            console.warn('Progress API unauthorized; cannot compute completion.');
          } else {
            console.warn('Progress API failed', e3);
          }
        }
      }
      const hasAnyCompletion = (isAuth && (hasCompletion || Object.keys(progressMap).length > 0)) || anyCompletedTrue;
      setSupportsCompletion(hasAnyCompletion);
      const roadmaps = (roadmapsRes.data || []) as LoTrinhItem[];

      // Sort lộ trình theo số trong mã: LT001 < LT002 < ...
      const loTrinhOrder = [...new Set(lessons.map(l => l.maLoTrinh))]
        .sort((a, b) => parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, "")));

      const titleMap = new Map<string, string>();
      roadmaps.forEach(r => {
        titleMap.set(r.maLoTrinh, `${r.capDo} - ${r.tenLoTrinh.replace(/^TOEIC\s+[A-Z0-9]+\s+-\s+/i, "")}`);
      });

      const weekGroups: WeekData[] = loTrinhOrder.map((maLoTrinh, idx) => {
        const items = lessons
          .filter(l => l.maLoTrinh === maLoTrinh)
          .sort((a, b) => a.soThuTu - b.soThuTu);

        const days: DayData[] = items.map((l, i) => {
          const maBai = l.maBai;
          const isCompleted = hasCompletion
            ? (l as any).daHoanThanhBaiHoc === true
            : (progressMap[maBai] === true);
          const status: DayData['status'] = isCompleted ? 'completed' : (idx === 0 && i === 0 ? 'current' : 'locked');
          return {
            day: i + 1,
            topic: (l.tenBai || `Bài ${i + 1}`).trim(),
            status,
            maBai: l.maBai,
            moTa: l.moTa,
            thoiLuongPhut: l.thoiLuongPhut,
          };
        });

        return {
          week: idx + 1,
          title: `Tuần ${idx + 1}: ${titleMap.get(maLoTrinh) || maLoTrinh}`,
          days,
        } as WeekData;
      });

      setWeeks(weekGroups);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(`Không thể tải lộ trình học tập. ${msg}`);
      console.error('Error fetching roadmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeekTitle = (weekNum: number): string => {
    const titles = [
      'Nền tảng từ vựng',
      'Giao tiếp thường ngày', 
      'Kỹ năng nghe nâng cao',
      'Tổng hợp và thực hành'
    ];
    return titles[weekNum - 1] || 'Học tập';
  };

  const handleStartLesson = (dayData: DayData) => {
    // Ngày 1: trang giới thiệu tĩnh
    if (dayData.day === 1 && /^BH001/i.test(dayData.maBai)) {
      navigate('/day1-intro');
      return;
    }
    // Các ngày khác: trang tổng quan bài học theo maBai
    navigate(`/lesson/overview/${dayData.maBai}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "current":
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "current":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-muted border-border";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchRoadmapData}>Thử lại</Button>
        </CardContent>
      </Card>
    );
  }

  if (weeks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chưa có lộ trình học tập nào.</p>
        </CardContent>
      </Card>
    );
  }

  const completedDays = weeks.flatMap(week => week.days).filter(day => day.status === "completed").length;
  const totalDays = weeks.flatMap(week => week.days).length;
  const progressPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Lộ trình học tập</h1>
          <p className="text-lg text-muted-foreground">
            Học tiếng Anh hiệu quả với chương trình được cá nhân hóa
          </p>
          {authNotice && (
            <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 inline-block px-3 py-1 rounded">
              {authNotice}
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Tiến độ học tập
              </CardTitle>
              <CardDescription className="text-base">
                Bạn đã hoàn thành {completedDays}/{totalDays} ngày học
              </CardDescription>
            </div>
            <Badge className="px-4 py-2">
              {progressPercentage}% hoàn thành
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {completedDays}
                </div>
                <p className="text-sm text-muted-foreground">Ngày đã học</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {totalDays}
                </div>
                <p className="text-sm text-muted-foreground">Tổng số ngày</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {totalDays - completedDays}
                </div>
                <p className="text-sm text-muted-foreground">Ngày còn lại</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <div className="grid gap-6">
        {weeks.map((week) => (
          <Card key={week.week} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {week.week}
                    </div>
                    {week.title}
                  </CardTitle>
                  <CardDescription>
                    Ngày {week.days[0].day} - {week.days[week.days.length - 1].day}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {week.days.filter(d => d.status === "completed").length}/{week.days.length} hoàn thành
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {week.days.map((day) => (
                  <div key={day.day} className={`p-4 rounded-lg border transition-all ${getStatusColor(day.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(day.status)}
                        <div>
                          <div className="font-medium">
                            Ngày {day.day}: {day.topic}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bài học
                            {day.thoiLuongPhut ? ` • ${day.thoiLuongPhut} phút` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isAuthenticated && day.status === "completed" && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 text-white">
                              <Trophy className="w-3 h-3 mr-1" />
                              Hoàn thành
                            </Badge>
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartLesson(day)}
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Học ngay
                            </Button>
                          </div>
                        )}
                        {isAuthenticated && day.status !== "completed" && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartLesson(day)}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Học ngay
                          </Button>
                        )}
                        {!isAuthenticated && day.status === "current" && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartLesson(day)}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Học ngay
                          </Button>
                        )}
                        {!isAuthenticated && day.status === "locked" && (
                          <Button size="sm" variant="outline" onClick={() => handleStartLesson(day)}>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Học ngay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          variant="default" 
          size="lg"
          onClick={() => {
            const currentDay = weeks.flatMap(w => w.days).find(d => d.status === "current");
            if (currentDay) {
              handleStartLesson(currentDay);
            } else {
              navigate('/dashboard');
            }
          }}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Tiếp tục học tập
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/dashboard')}
        >
          <Target className="w-4 h-4 mr-2" />
          Xem dashboard
        </Button>
      </div>
    </div>
  );
};

export default StudyRoadmap25Days;