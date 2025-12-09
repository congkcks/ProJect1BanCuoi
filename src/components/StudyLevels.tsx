import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  GraduationCap, 
  Target, 
  Star, 
  Clock, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Award,
  CheckCircle,
  ArrowRight,
  Users
} from "lucide-react";
import { apiService, type LoTrinhItem } from "@/services/api";

const StudyLevels = () => {
  const navigate = useNavigate();

  // Remote data from backend "LoTrinh/co-san"
  const [roadmaps, setRoadmaps] = useState<LoTrinhItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getAvailableRoadmaps();
        if (!isMounted) return;
        setRoadmaps(res.data || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Không thể tải lộ trình. Vui lòng thử lại.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to parse backend list strings like: "'item1','item2'"
  const parseList = (raw?: string | null): string[] => {
    if (!raw) return [];
    // Split by comma, remove quotes and spaces, handle newlines
    return raw
      .split(/,\s*/)
      .map((s) => s.replace(/^['"]|['"]$/g, "").trim())
      .filter(Boolean);
  };

  type Skill = { name: string; icon: ComponentType<any>; level: string };
  type UiLevel = {
    id: string;
    code?: string;
    name: string;
    description: string;
    color: string;
    progress: number;
    duration: string;
    targetScore: string;
    skills: Skill[];
    lessons: string[];
    completed: number;
    total: number;
  };

  // Map backend roadmaps to UI levels when available
  const levels = useMemo<UiLevel[]>(() => {
    if (!roadmaps || roadmaps.length === 0) return [] as UiLevel[];
    // Hide A1 - Chuyên sâu entirely
    const filtered = roadmaps.filter((r) => {
      const isA1 = r.capDo === 'A1';
      const isChuyenSau = (r.loaiLoTrinh && /chuyên\s*sâu/i.test(r.loaiLoTrinh)) || /chuyên\s*sâu/i.test(r.tenLoTrinh || '');
      return !(isA1 && isChuyenSau);
    });
    return filtered.map((r) => {
      const skillNames = parseList(r.kyNangTrongTam);
      const lessonNames = parseList(r.chuDeBaiHoc);
      const skills = skillNames.map((name) => ({
        name,
        icon:
          /từ vựng/i.test(name) ? BookOpen :
          /ngữ pháp|viết/i.test(name) ? PenTool :
          Headphones,
        level: /nâng cao/i.test(name) ? 'Nâng cao' : /cơ bản/i.test(name) ? 'Cần thiết' : 'Trọng tâm',
      }));
      const lessons = lessonNames;

      return {
        id: r.maLoTrinh,     // unique key
        code: r.capDo,       // display in circle
        name: `${r.capDo} - ${r.tenLoTrinh.replace(/^TOEIC\s+[A-Z0-9]+\s+-\s+/i, "")}`,
        description: r.moTa,
        color:
          r.capDo === 'A1' ? 'bg-green-500' :
          r.capDo === 'A2' ? 'bg-blue-500' :
          r.capDo === 'B1' ? 'bg-purple-500' :
          r.capDo === 'B2' ? 'bg-orange-500' : 'bg-slate-500',
        progress: 0, // Backend chưa cung cấp tiến độ
        duration: r.thoiGianDuKien,
        targetScore: `${r.mucTieuDiem} điểm TOEIC`,
        skills,
        lessons,
        completed: 0,
        total: r.tongSoBai || lessons.length,
      } as UiLevel;
    });
  }, [roadmaps]);

  const getCurrentLevel = () => {
    return levels.find(level => level.progress > 0 && level.progress < 100) || levels[0];
  };

  const currentLevel = levels.length > 0 ? getCurrentLevel() : null;

  return (
    <div className="space-y-8">
      {/* Loading / Error States */}
      {loading && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTitle>Đang tải lộ trình...</AlertTitle>
          <AlertDescription>Vui lòng đợi trong giây lát.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-toeic-blue to-toeic-success rounded-full flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-toeic-navy">Lộ trình học theo cấp độ</h1>
          <p className="text-lg text-muted-foreground">
            Phát triển kỹ năng tiếng Anh từ cơ bản đến thành thạo
          </p>
        </div>
      </div>

      {/* Empty state when no roadmaps to show */}
      {!loading && !error && levels.length === 0 && (
        <div className="text-center text-muted-foreground">Chưa có lộ trình khả dụng.</div>
      )}

      {/* Current Level Progress */}
      {currentLevel && currentLevel.progress > 0 && (
        <Card className="bg-gradient-to-r from-toeic-blue/10 to-toeic-success/10 border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-toeic-navy">
                  Cấp độ hiện tại: {currentLevel.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentLevel.description}
                </CardDescription>
              </div>
              <Badge className={`${currentLevel.color} text-white px-4 py-2`}>
                {currentLevel.progress}% hoàn thành
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={currentLevel.progress} className="h-3" />
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-toeic-blue">
                    {currentLevel.completed}/{currentLevel.total}
                  </div>
                  <p className="text-sm text-muted-foreground">Bài học</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-toeic-success">
                    {currentLevel.duration}
                  </div>
                  <p className="text-sm text-muted-foreground">Thời gian dự kiến</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="text-sm font-bold text-toeic-warning">
                    {currentLevel.targetScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Mục tiêu điểm số</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level Details */}
      <div className="grid gap-6">
        {levels.map((level, index) => (
          <Card key={level.id} className={`${level.progress === 100 ? 'bg-green-50 border-green-200' : level.progress > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${level.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {level.code ?? level.id}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-toeic-navy">{level.name}</CardTitle>
                    <CardDescription className="text-base">{level.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {level.progress === 100 && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Hoàn thành
                    </Badge>
                  )}
                  {level.progress > 0 && level.progress < 100 && (
                    <Badge className="bg-blue-500 text-white">
                      Đang học
                    </Badge>
                  )}
                  {level.progress === 0 && (
                    <Badge variant="outline">
                      Chưa bắt đầu
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Kỹ năng trọng tâm */}
                <div>
                  <h4 className="font-semibold text-toeic-navy mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Kỹ năng trọng tâm
                  </h4>
                  <div className="space-y-2">
                    {level.skills.length > 0 ? (
                      level.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex items-center justify-between p-2 bg-white/50 rounded">
                          <div className="flex items-center space-x-2">
                            <skill.icon className="w-4 h-4 text-toeic-blue" />
                            <span className="text-sm">{skill.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {skill.level}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Chưa cập nhật</div>
                    )}
                  </div>
                </div>

                {/* Chủ đề bài học (right column) */}
                <div>
                  <h4 className="font-semibold text-toeic-navy mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Chủ đề bài học
                  </h4>
                  <div className="space-y-2">
                    {level.lessons && level.lessons.length > 0 ? (
                      (() => {
                        const completedCount = Math.round(((level.total || level.lessons.length) * (level.progress || 0)) / 100);
                        return level.lessons.map((lesson, li) => {
                          const isDone = level.progress === 100 || li < completedCount;
                          return (
                            <div key={li} className="flex items-center justify-between p-2 bg-white/50 rounded">
                              <div className="flex items-center space-x-2">
                                {isDone ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-200" />
                                )}
                                <span className={`${isDone ? 'line-through text-muted-foreground' : ''} text-sm`}>{lesson}</span>
                              </div>
                            </div>
                          );
                        });
                      })()
                    ) : (
                      <div className="text-sm text-muted-foreground">Chưa cập nhật</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-6 items-center">
                {/* If not started: show green Start button first */}
                {level.progress === 0 && (
                  <Button
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 border-none"
                    onClick={() => navigate(`/roadmap/${level.id}/all`)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Bắt đầu cấp độ này
                  </Button>
                )}

                {/* If already started and not finished: show Continue as primary */}
                {level.progress > 0 && level.progress < 100 && (
                  <Button 
                    variant="hero"
                    onClick={() => navigate(`/roadmap/${level.id}/all`)}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Tiếp tục học
                  </Button>
                )}

                {/* Utility buttons: white by default, turn blue on hover */}
                <Button size="sm" className="bg-white text-toeic-blue hover:bg-toeic-blue hover:text-white border border-slate-200" onClick={() => navigate(`/roadmap/${level.id}/reading`)}>
                  Bài đọc hiểu
                </Button>
                <Button size="sm" className="bg-white text-toeic-blue hover:bg-toeic-blue hover:text-white border border-slate-200" onClick={() => navigate(`/roadmap/${level.id}/listening`)}>
                  Bài luyện nghe
                </Button>
                <Button size="sm" className="bg-white text-toeic-blue hover:bg-toeic-blue hover:text-white border border-slate-200" onClick={() => navigate(`/roadmap/${level.id}/writing`)}>
                  Bài tập viết
                </Button>
                <Button size="sm" className="bg-white text-toeic-blue hover:bg-toeic-blue hover:text-white border border-slate-200" onClick={() => navigate(`/roadmap/${level.id}/speaking`)}>
                  Luyện giao tiếp
                </Button>

                {/* When started=complete show certificate button */}
                {level.progress === 100 && (
                  <Button variant="outline">
                    <Award className="w-4 h-4 mr-2" />
                    Xem chứng chỉ
                  </Button>
                )}

                <div className="ml-auto">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Chi tiết lộ trình {level.duration ?? '25 ngày'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyLevels;
