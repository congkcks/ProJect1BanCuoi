import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToeicTestList } from "@/hooks/useToeicTestList";
import { Clock, FileText, Target, Calendar } from "lucide-react";

const ToeicTestList = () => {
  const navigate = useNavigate();
  const { data: tests, isLoading, error } = useToeicTestList();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Lỗi</CardTitle>
            <CardDescription>Không thể tải danh sách đề thi. Vui lòng thử lại sau.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Đề Thi TOEIC Reading</h1>
        <p className="text-muted-foreground">Chọn một đề thi để bắt đầu luyện tập</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests?.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{test.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Năm {test.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Thời gian: {test.duration_minutes} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>Số câu hỏi: {test.num_questions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-primary">{test.target_level}</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => navigate(`/toeic-test/${test.id}`)}
              >
                Bắt đầu làm bài
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToeicTestList;
