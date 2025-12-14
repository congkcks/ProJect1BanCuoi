import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info, Target, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Day1IntroPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMarkCompleted = async () => {
    try {
      if (apiService.isAuthenticated()) {
        let updated = false;
        try {
          // Try minimal payload: many backends only need percent
          await apiService.updateTienDo('BH001', {
            phanTramHoanThanh: 100,
            thoiGianHocPhut: 1,
          });
          updated = true;
        } catch (err1: any) {
          // Fallback: send Vietnamese status the API expects
          try {
            await apiService.updateTienDo('BH001', {
              trangThai: 'Hoàn thành',
              phanTramHoanThanh: 100,
              thoiGianHocPhut: 1,
            });
            updated = true;
          } catch (err2: any) {
            // Last resort: try lowercase/ASCII
            await apiService.updateTienDo('BH001', {
              trangThai: 'hoan thanh',
              phanTramHoanThanh: 100,
              thoiGianHocPhut: 1,
            });
            updated = true;
          }
        }
        if (!updated) throw new Error('Không thể cập nhật tiến độ');
      }
      // Persist local completion as instant UX fallback
      try {
        // Scope keys per user to avoid cross-account leakage
        const userKey = apiService.getCurrentUserId() || 'guest';
        const manualKey = `manualCompletedLessons:${userKey}`;
        const manualRaw = localStorage.getItem(manualKey);
        const manualList = Array.isArray(manualRaw ? JSON.parse(manualRaw) : null) ? JSON.parse(manualRaw as string) : [];
        const manualSet = new Set<string>(manualList);
        manualSet.add('BH001');
        localStorage.setItem(manualKey, JSON.stringify(Array.from(manualSet)));

        // Explicit boolean marker for fast checks
        localStorage.setItem(`bh001ManualCompleted:${userKey}`, 'true');
      } catch { }
      try {
        // Notify other views (e.g., Roadmap) to refresh
        window.dispatchEvent(new CustomEvent('progress:updated', { detail: { maBai: 'BH001', percent: 100 } }));
      } catch { }
      toast({ title: 'Đã đánh dấu hoàn thành', description: 'Day 1 đã được cập nhật.' });
      navigate('/lesson/overview/BH002');
    } catch (e: any) {
      toast({ title: 'Không thể cập nhật tiến độ', description: e?.message || 'Vui lòng thử lại.', variant: 'destructive' as any });
    }
  };
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold">Ngày 1: Giới thiệu về TOEIC</h1>
        <p className="text-muted-foreground">Tổng quan kỳ thi, cấu trúc đề và cách tính điểm</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cấu trúc đề thi TOEIC</CardTitle>
          <CardDescription>Listening 495 điểm + Reading 495 điểm = Tổng 990 điểm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Listening:</strong> 4 phần – Photographs, Question-Response, Conversations, Talks</li>
            <li><strong>Reading:</strong> 3 phần – Incomplete Sentences, Text Completion, Reading Comprehension</li>
            <li><strong>Thời lượng:</strong> khoảng 2 giờ</li>
          </ul>
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded border bg-background flex items-center gap-2"><Target className="w-4 h-4 text-blue-600" />Định hướng mục tiêu</div>
            <div className="p-3 rounded border bg-background flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" />Tài liệu cần chuẩn bị</div>
            <div className="p-3 rounded border bg-background flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" />Lịch học đề xuất</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mục tiêu buổi học</CardTitle>
          <CardDescription>Giúp bạn hiểu kỳ thi và bắt đầu đúng hướng</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Nắm rõ format đề thi và cách tính điểm',
              'Biết các mẹo làm bài cơ bản',
              'Cài đặt môi trường học và lộ trình tuần 1'
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-1 w-4 h-4 text-green-600" />{t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleMarkCompleted}>Đánh dấu hoàn thành</Button>
      </div>
    </div>
  );
};

export default Day1IntroPage;
