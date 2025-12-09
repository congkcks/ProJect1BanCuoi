import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService, type LessonItem, type RoadmapLessonsResponse, type TienDoHocTapListResponse, type BaiDocItem, type BaiNgheItem } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Brain, Clock, Headphones, PenTool, Sparkles, ArrowRight, Calendar, Target, Trophy, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

type FilterKey = "all" | "reading" | "listening" | "writing" | "speaking";

type FilterConfig = {
  label: string;
  description: string;
  icon: ReactNode;
  predicate?: (lesson: LessonItem) => boolean;
};

const SKILL_KEYWORDS = {
  writing: ['viết', 'writing', 'ngữ pháp', 'grammar', 'từ vựng', 'essay', 'bài tập viết', 'writing practice'],
  speaking: ['giao tiếp', 'speaking', 'đàm thoại', 'conversation', 'hội thoại', 'nói chuyện', 'pronunciation', 'speaking practice'],
} as const;

const matchesSkill = (lesson: LessonItem, skill: keyof typeof SKILL_KEYWORDS): boolean => {
  const keywords = SKILL_KEYWORDS[skill];
  const texts: string[] = [];
  if (lesson.tenBai) texts.push(lesson.tenBai);
  if (lesson.moTa) texts.push(lesson.moTa);
  lesson.videos?.forEach((video) => {
    if (video.tieuDeVideo) texts.push(video.tieuDeVideo);
  });

  const normalized = texts.map((t) => t.toLowerCase());
  const hasKeyword = normalized.some((text) => keywords.some((kw) => text.includes(kw)));

  if (hasKeyword) return true;

  if (skill === 'writing') {
    const hasVideoOnly = (lesson.videos?.length ?? 0) > 0 && (lesson.baiDocs?.length ?? 0) === 0 && (lesson.baiNghes?.length ?? 0) === 0;
    return hasVideoOnly;
  }

  if (skill === 'speaking') {
    const hasConversationAssets = (lesson.videos?.length ?? 0) > 0 && (lesson.baiNghes?.length ?? 0) > 0;
    return hasConversationAssets;
  }

  return false;
};

const FILTERS: Record<FilterKey, FilterConfig> = {
  all: {
    label: "Bắt đầu cấp độ",
    description: "Tổng hợp tất cả nội dung của lộ trình",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  reading: {
    label: "Bài đọc hiểu",
    description: "Chỉ hiện thị các bài đọc",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    predicate: (lesson) => (lesson.baiDocs?.length ?? 0) > 0,
  },
  listening: {
    label: "Bài luyện nghe",
    description: "Chỉ hiện thị các bài nghe",
    icon: <Headphones className="w-3.5 h-3.5" />,
    predicate: (lesson) => (lesson.baiNghes?.length ?? 0) > 0,
  },
  writing: {
    label: "Bài tập viết",
    description: "Ưu tiên nội dung viết/grammar",
    icon: <PenTool className="w-3.5 h-3.5" />,
    predicate: (lesson) => matchesSkill(lesson, 'writing'),
  },
  speaking: {
    label: "Luyện giao tiếp",
    description: "Các nội dung hội thoại/video",
    icon: <Brain className="w-3.5 h-3.5" />,
    predicate: (lesson) => matchesSkill(lesson, 'speaking'),
  },
};

const LESSONS_PER_WEEK = 7;

// Helper: parse backend "'a','b'" strings or arrays into string[]
const parseList = (raw?: string | string[] | null): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).replace(/^['"\s]+|['"\s]+$/g, '').trim()).filter(Boolean);
  return raw
    .split(/,\s*|\n+/)
    .map((s) => s.replace(/^['"\s]+|['"\s]+$/g, '').trim())
    .filter(Boolean);
};

const getPrimarySkill = (lesson: LessonItem): string => {
  if ((lesson.baiDocs?.length ?? 0) > 0) return "Đọc hiểu";
  if ((lesson.baiNghes?.length ?? 0) > 0) return "Nghe";
  if ((lesson.videos?.length ?? 0) > 0) return "Viết / Video";
  return "Tổng hợp";
};

const getLessonLink = (lesson: LessonItem, filter: FilterKey): string => {
  const doc = lesson.baiDocs?.[0];
  const listening = lesson.baiNghes?.[0];
  // For reading: navigate unified route /lesson/reading/:readingId where readingId can be maBaiDoc
  if (filter === "reading" && doc) return `/lesson/reading/${doc.maBaiDoc}`;
  if (filter === "listening" && listening) return `/listening-item/${listening.maBaiNghe}`;
  if (filter === "writing") return "/lesson/writing";
  if (filter === "speaking") return "/lesson/conversation";
  // Fallbacks
  if (doc) return `/lesson/reading/${doc.maBaiDoc}`;
  if (listening) return `/listening-item/${listening.maBaiNghe}`;
  return `/lesson/overview/${lesson.maBai}`;
};

// No local fallback anymore; data will be fetched directly from API

const RoadmapLessonsPage = () => {
  const navigate = useNavigate();
  const { maLoTrinh, filter: filterParam } = useParams<{ maLoTrinh?: string; filter?: string }>();
  const { isAuthenticated } = useAuth();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [roadmapMeta, setRoadmapMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [statusMap, setStatusMap] = useState<Record<string, 'completed' | 'current' | 'locked'>>({});

  const normalizedFilter = (filterParam?.toLowerCase() as FilterKey) ?? "all";
  const activeFilter: FilterKey = FILTERS[normalizedFilter] ? normalizedFilter : "all";
  const isFlatList = ['reading', 'listening', 'writing', 'speaking'].includes(activeFilter);

  useEffect(() => {
    if (!maLoTrinh) {
      setLessons([]);
      setLoading(false);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        let nextItems: LessonItem[] = [];

        // For reading/listening filters, always fetch from main endpoint to get daHoanThanh status
        if (activeFilter === 'reading' || activeFilter === 'listening') {
          // Fetch authenticated roadmap data to get daHoanThanh flags
          let payload: any;
          if (isAuthenticated) {
            try {
              const res = await apiService.getLessonsByRoadmapWithStatus(maLoTrinh);
              payload = res;
              console.log('Authenticated roadmap for reading/listening:', res);
            } catch (e: any) {
              console.warn('Failed to load authenticated roadmap data for reading/listening:', e);
              const res = await apiService.getLessonsByRoadmap(maLoTrinh);
              payload = (res as any)?.data && (res as any)?.data.data ? (res as any).data : res;
            }
          } else {
            const res = await apiService.getLessonsByRoadmap(maLoTrinh);
            payload = (res as any)?.data && (res as any)?.data.data ? (res as any).data : res;
          }

          const payloadData = Array.isArray(payload) ? payload : (payload?.data ?? []);
          
          setRoadmapMeta({
            tenLoTrinh: payload.tenLoTrinh ?? undefined,
            kyNangTrongTam: parseList(payload.kyNangTrongTam),
            chuDeBaiHoc: parseList(payload.chuDeBaiHoc),
            tongSoBaiHoc: payload.tongSoBaiHoc ?? (Array.isArray(payloadData) ? payloadData.length : 0)
          } as any);

          if (activeFilter === 'reading') {
            // Extract all baiDocs from all lessons
            const allDocs: any[] = [];
            payloadData.forEach((lesson: any, lessonIdx: number) => {
              (lesson.baiDocs ?? []).forEach((doc: any, docIdx: number) => {
                allDocs.push({
                  ...doc,
                  // Store synthetic maBai combining lesson + doc for unique identity
                  maBai: `${lesson.maBai}::${doc.maBaiDoc}`,
                  parentMaBai: lesson.maBai,
                  soThuTu: lessonIdx * 100 + docIdx
                });
              });
            });

            nextItems = allDocs.map((d: any) => ({
              maBai: d.maBai,
              maLoTrinh: maLoTrinh,
              tenBai: d.tieuDe?.trim() || 'Bài đọc',
              moTa: d.doKho || null,
              thoiLuongPhut: 30,
              soThuTu: d.soThuTu,
              ngayTao: d.ngayTao || new Date().toISOString(),
              videos: [],
              baiNghes: [],
              baiDocs: [{ ...d, daHoanThanh: d.daHoanThanh ?? false }],
              // Mark as completed if daHoanThanh is true
              _status: (isAuthenticated && d.daHoanThanh) ? 'completed' : undefined
            }));
          } else if (activeFilter === 'listening') {
            // Extract all baiNghes from all lessons
            const allAudios: any[] = [];
            payloadData.forEach((lesson: any, lessonIdx: number) => {
              (lesson.baiNghes ?? []).forEach((audio: any, audioIdx: number) => {
                allAudios.push({
                  ...audio,
                  maBai: `${lesson.maBai}::${audio.maBaiNghe}`,
                  parentMaBai: lesson.maBai,
                  soThuTu: lessonIdx * 100 + audioIdx
                });
              });
            });

            nextItems = allAudios.map((a: any) => ({
              maBai: a.maBai,
              maLoTrinh: maLoTrinh,
              tenBai: a.tieuDe?.trim() || 'Bài nghe',
              moTa: a.doKho || a.banGhiAm || null,
              thoiLuongPhut: 20,
              soThuTu: a.soThuTu,
              ngayTao: a.ngayTao || new Date().toISOString(),
              videos: [],
              baiNghes: [{ ...a, daHoanThanh: a.daHoanThanh ?? false }],
              baiDocs: [],
              // Mark as completed if daHoanThanh is true
              _status: (isAuthenticated && a.daHoanThanh) ? 'completed' : undefined
            }));
          }
        } else {
          // Fetch general lessons by roadmap - with user-specific data if authenticated
          let payload: any;
          if (isAuthenticated) {
            try {
              const res = await apiService.getLessonsByRoadmapWithStatus(maLoTrinh);
              // Response is full object with metadata and data array
              payload = res;
              console.log('Authenticated roadmap response:', res);
            } catch (e: any) {
              console.warn('Failed to load authenticated roadmap data, falling back to public:', e);
              const res = await apiService.getLessonsByRoadmap(maLoTrinh);
              payload = (res as any)?.data && (res as any)?.data.data ? (res as any).data : res;
            }
          } else {
            const res = await apiService.getLessonsByRoadmap(maLoTrinh);
            payload = (res as any)?.data && (res as any)?.data.data ? (res as any).data : res;
          }

          // Extract data array from payload
          const payloadData = Array.isArray(payload) ? payload : (payload?.data ?? []);
          console.log('Final payloadData length:', payloadData.length, 'payload:', payload);

          setRoadmapMeta({
            tenLoTrinh: payload.tenLoTrinh ?? undefined,
            kyNangTrongTam: parseList(payload.kyNangTrongTam),
            chuDeBaiHoc: parseList(payload.chuDeBaiHoc),
            tongSoBaiHoc: payload.tongSoBaiHoc ?? (Array.isArray(payloadData) ? payloadData.length : 0),
            soBaiHoanThanh: payload.soBaiHoanThanh ?? 0
          } as any);
          
          // Build status map from API daHoanThanhBaiHoc flags if authenticated
          const apiStatusMap: Record<string, 'completed' | 'current' | 'locked'> = {};
          if (isAuthenticated && Array.isArray(payloadData)) {
            payloadData.forEach((it: any, idx: number) => {
              if (it.daHoanThanhBaiHoc) {
                apiStatusMap[it.maBai] = 'completed';
              }
            });
          }
          
          nextItems = (payloadData ?? []).map((it: any) => {
            const item: any = {
              maBai: it.maBai,
              maLoTrinh: it.maLoTrinh ?? maLoTrinh,
              tenBai: it.tenBai?.trim ? it.tenBai.trim() : (it.tenBai || 'Bài học'),
              moTa: it.moTa ?? null,
              thoiLuongPhut: typeof it.thoiLuongPhut === 'number' ? it.thoiLuongPhut : 30,
              soThuTu: typeof it.soThuTu === 'number' ? it.soThuTu : 0,
              ngayTao: it.ngayTao ?? new Date().toISOString(),
              videos: Array.isArray(it.videos) ? it.videos : [],
              baiNghes: Array.isArray(it.baiNghes) ? it.baiNghes.map((n: any) => ({ ...n, daHoanThanh: n.daHoanThanh ?? false })) : [],
              baiDocs: Array.isArray(it.baiDocs) ? it.baiDocs.map((d: any) => ({ ...d, daHoanThanh: d.daHoanThanh ?? false })) : [],
              // Store API completion status directly
              _status: apiStatusMap[it.maBai] ?? undefined
            };
            return item;
          });
        }

        setLessons(nextItems);
        if (!ignore && nextItems.length === 0) setError('Chưa tìm thấy bài học cho lộ trình này');

        // Progress mapping: only apply statusMap if _status not already set from API
        try {
          if (!isAuthenticated) {
            // No token: mark the first as current, others locked to avoid 401 spam
            const map: Record<string, 'completed' | 'current' | 'locked'> = {};
            nextItems.forEach((it, idx) => { 
              // Don't override if already set from API
              if (!it._status) {
                map[it.maBai] = idx === 0 ? 'current' : 'locked'; 
              }
            });
            setStatusMap(map);
          } else if (activeFilter === 'all') {
            // For 'all' tab with authenticated user, status should come from API daHoanThanhBaiHoc
            // Only fill gaps if not already set
            const map: Record<string, 'completed' | 'current' | 'locked'> = {};
            const firstNotDone = nextItems.findIndex(it => it._status !== 'completed');
            nextItems.forEach((it, idx) => {
              if (!it._status) {
                map[it.maBai] = (idx === firstNotDone || (firstNotDone === -1 && idx === 0)) ? 'current' : 'locked';
              }
            });
            setStatusMap(map);
          } else {
            // For reading/listening filters, fetch progress normally
            const progress: TienDoHocTapListResponse = await apiService.getTienDoByLoTrinh(maLoTrinh);
            const done = new Set(
              (progress?.data ?? [])
                .filter(p => (p.phanTramHoanThanh ?? 0) >= 100 || /hoàn\s*thành|completed/i.test(p.trangThai || ''))
                .map(p => p.maBai)
            );
            const firstNotDone = nextItems.findIndex(it => !done.has(it.maBai));
            const map: Record<string, 'completed' | 'current' | 'locked'> = {};
            nextItems.forEach((it, idx) => {
              map[it.maBai] = done.has(it.maBai) ? 'completed' : (idx === firstNotDone || (firstNotDone === -1 && idx === 0) ? 'current' : 'locked');
            });
            setStatusMap(map);
          }
        } catch {}
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách bài học');
          setLessons([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [maLoTrinh, activeFilter]);

  const filteredLessons = useMemo(() => {
    const predicate = FILTERS[activeFilter].predicate;
    if (!predicate) return lessons;
    return lessons.filter(predicate);
  }, [lessons, activeFilter]);

  const weeks = useMemo(() => {
    const chunked: (LessonItem & { _status?: 'completed' | 'current' | 'locked' })[][] = [];
    filteredLessons.forEach((lesson, index) => {
      const weekIndex = Math.floor(index / LESSONS_PER_WEEK);
      if (!chunked[weekIndex]) chunked[weekIndex] = [];
      // Use _status from lesson if available, otherwise fall back to statusMap
      (chunked[weekIndex] as any).push({ 
        ...lesson, 
        _status: (lesson as any)._status ?? statusMap[lesson.maBai] 
      });
    });
    return chunked;
  }, [filteredLessons, statusMap]);

  const totalWeeks = Math.max(1, weeks.length || Math.ceil(filteredLessons.length / LESSONS_PER_WEEK));

  const handleFilterChange = (key: FilterKey) => {
    if (!maLoTrinh) return;
    navigate(`/roadmap/${maLoTrinh}/${key}`);
  };

  if (!maLoTrinh) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Thiếu mã lộ trình</AlertTitle>
          <AlertDescription>Vui lòng quay lại trang Lộ trình học để chọn cấp độ.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="col-span-2 space-y-2">
          <Button
            variant="ghost"
            className="px-0 text-sm"
            onClick={() => navigate('/study-plan')}
          >
            ← Quay lại Lộ trình học
          </Button>
          <h1 className="text-2xl font-bold">{roadmapMeta?.tenLoTrinh ?? `Lộ trình ${maLoTrinh}`}</h1>
          <p className="text-sm text-muted-foreground">
            Lựa chọn nội dung theo kỹ năng để tiếp tục học tập. Tổng cộng {filteredLessons.length} bài học phù hợp.
          </p>
          {roadmapMeta?.kyNangTrongTam && (
            <div className="mt-3 flex flex-wrap gap-2">
              {String(roadmapMeta.kyNangTrongTam).split(/,|\n/).map((k: string, i: number) => (
                <Badge key={i} className="px-3 py-2 bg-white border-slate-100">{k.replace(/^['"\s]+|['"\s]+$/g, '')}</Badge>
              ))}
            </div>
          )}
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-24 p-4 bg-white border border-slate-100 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Chủ đề bài học</h3>
            <ul className="space-y-2 text-sm">
              {(roadmapMeta?.chuDeBaiHoc || []).map((t: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-3 h-3 bg-green-100 rounded-full inline-block" />
                  {String(t).replace(/^['"\s]+|['"\s]+$/g, '')}
                </li>
              ))}
              {!roadmapMeta?.chuDeBaiHoc && (
                <li className="text-xs text-muted-foreground">Chưa có chủ đề</li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
          <Button
            key={key}
            variant={key === activeFilter ? "default" : "outline"}
            className="rounded-full px-4"
            onClick={() => handleFilterChange(key)}
          >
            <span className="flex items-center gap-2 text-sm">
              {FILTERS[key].icon}
              {FILTERS[key].label}
            </span>
          </Button>
        ))}
      </div>

      {/* Week Navigation (hide for flat list views like Reading/Listening) */}
      {!isFlatList && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Badge variant="outline" className="px-4 py-2">
            Tuần {currentWeek} / {totalWeeks}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
            disabled={currentWeek === totalWeeks}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="border border-slate-100">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((__ , row) => (
                  <div key={row} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Không thể tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : weeks.length === 0 ? (
        <Card className="border border-slate-200">
          <CardContent className="py-10 text-center text-muted-foreground">
            Không có bài học phù hợp với bộ lọc này.
          </CardContent>
        </Card>
      ) : isFlatList ? (
        <div className="space-y-3">
          {filteredLessons.map((item, idx) => {
            const status = (item as any)._status as ('completed' | 'current' | 'locked' | undefined);
            const lessonType = getPrimarySkill(item);
            const isCompleted = status === 'completed';
            const icon = lessonType === 'Đọc hiểu'
              ? <BookOpen className="w-5 h-5" />
              : lessonType === 'Nghe'
                ? <Headphones className="w-5 h-5" />
                : lessonType.includes('Viết')
                  ? <PenTool className="w-5 h-5" />
                  : <Target className="w-5 h-5" />;

            return (
              <div
                key={`${item.maBai}-${idx}-${activeFilter}`}
                className={`flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 sm:flex-row sm:items-center ${
                  isCompleted ? 'border-green-200 bg-green-50/30' : status === 'current' ? 'border-toeic-blue/60 bg-blue-50/30' : ''
                }`}
              >
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    {icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold leading-snug">{item.tenBai}</p>
                    {item.moTa && <p className="text-sm text-muted-foreground line-clamp-2">{item.moTa}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {lessonType}
                      </Badge>
                      {item.thoiLuongPhut && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.thoiLuongPhut} phút
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  {isCompleted && <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">Đã hoàn thành</Badge>}
                  {status === 'current' ? (
                    <Button size="sm" variant="hero" className="min-w-[150px]" onClick={() => navigate(getLessonLink(item, activeFilter))}>Bắt đầu học</Button>
                  ) : isCompleted ? (
                    <Button size="sm" variant="outline" className="min-w-[150px]" onClick={() => navigate(getLessonLink(item, activeFilter))}>Học lại</Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="min-w-[150px]" disabled={status === 'locked'} onClick={() => navigate(getLessonLink(item, activeFilter))}>
                      {status === 'locked' ? 'Đã khóa' : 'Bắt đầu học'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {(weeks[currentWeek - 1] || []).map((item, idx) => {
            const dayWithinWeek = idx + 1;
            const dayNumber = (currentWeek - 1) * LESSONS_PER_WEEK + dayWithinWeek;
            const status = (item as any)._status as ('completed' | 'current' | 'locked' | undefined);
            const lessonType = getPrimarySkill(item);
            const isCompleted = status === 'completed';

            const dayColorClasses = [
              'bg-[#0b0e2c] text-white',
              'bg-[#b59aa8] text-white',
              'bg-[#f5a623] text-white',
              'bg-[#f37021] text-white',
              'bg-[#f8d7a3] text-slate-800',
              'bg-[#f4b792] text-white',
              'bg-[#f8cf98] text-slate-800'
            ];
            const badgeColor = dayColorClasses[(dayWithinWeek - 1) % dayColorClasses.length];

            const border = isCompleted
              ? 'border-toeic-success'
              : status === 'current'
                ? 'border-toeic-blue border-2'
                : 'border-muted';

            return (
              <Card key={`${item.maBai}-${idx}-grid`} className={`relative flex flex-col transition-all hover:shadow-md min-h-[240px] ${border}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${badgeColor} text-xs font-medium rounded-full px-3 py-1`}>Day {dayNumber}</Badge>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-toeic-success" />}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col flex-1">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start space-x-2">
                      {lessonType === 'Đọc hiểu' && <BookOpen className="w-4 h-4" />}
                      {lessonType === 'Nghe' && <Headphones className="w-4 h-4" />}
                      {lessonType.includes('Viết') && <PenTool className="w-4 h-4" />}
                      {!['Đọc hiểu','Nghe'].includes(lessonType) && !lessonType.includes('Viết') && <Target className="w-4 h-4" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug line-clamp-6">{item.tenBai}</p>
                      </div>
                    </div>
                  </div>
                  {status === 'current' ? (
                    <Button size="sm" variant="hero" className="w-full mt-2 text-xs" onClick={() => navigate(getLessonLink(item, activeFilter))}>Bắt đầu học</Button>
                  ) : isCompleted ? (
                    <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={() => navigate(getLessonLink(item, activeFilter))}>Học lại</Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled className="w-full mt-2 text-xs">Bắt đầu học</Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoadmapLessonsPage;
