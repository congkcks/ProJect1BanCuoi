import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { testApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Clock, Trophy, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

const History = () => {
  const navigate = useNavigate();

  // Lấy email trực tiếp từ localStorage
  const userEmail = localStorage.getItem("userEmail");

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["testHistory", userEmail],
    queryFn: async () => {
      const result = await testApi.getTestHistory(userEmail!);
      // API trả về object với data array
      return result?.data || [];
    },
    enabled: !!userEmail,
  });

  const handleViewReview = (sessionId: string) => {
    navigate(`/review/${sessionId}`);
  };

  const calculateDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return "Chưa hoàn thành";
    const start = new Date(startedAt);
    const finish = new Date(finishedAt);
    const durationMs = finish.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-success";
    if (score >= 600) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-xl font-bold">Lịch sử làm bài</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Chưa có email - yêu cầu làm bài trước */}
        {!userEmail ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Bạn cần làm bài test trước để có lịch sử</p>
              <Button onClick={() => navigate("/")}>Làm bài ngay</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Lịch sử làm bài</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Đang tải lịch sử...</p>
                </div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive mb-4">Không thể tải lịch sử</p>
                  <Button onClick={() => navigate("/")}>Về trang chủ</Button>
                </CardContent>
              </Card>
            ) : !history || history.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Chưa có lịch sử làm bài</p>
                  <Button onClick={() => navigate("/")}>Làm bài ngay</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((session) => (
                  <Card
                    key={session.sessionId}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleViewReview(session.sessionId)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {session.testId}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(session.startedAt), "PPP")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {calculateDuration(session.startedAt, session.finishedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            <span className={`text-2xl font-bold ${getScoreColor(session.totalScore)}`}>
                              {session.totalScore}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            TOEIC Score
                          </p>
                        </div>
                      </div>
                      <Button className="w-full" variant="secondary">
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
