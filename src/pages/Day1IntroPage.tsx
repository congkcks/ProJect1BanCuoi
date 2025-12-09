import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info, Target, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Day1IntroPage = () => {
  const navigate = useNavigate();
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
            <div className="p-3 rounded border bg-background flex items-center gap-2"><Target className="w-4 h-4 text-blue-600"/>Định hướng mục tiêu</div>
            <div className="p-3 rounded border bg-background flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600"/>Tài liệu cần chuẩn bị</div>
            <div className="p-3 rounded border bg-background flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600"/>Lịch học đề xuất</div>
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
            ].map((t,i)=> (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-1 w-4 h-4 text-green-600"/>{t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => navigate('/lesson/overview/BH002')}>Bắt đầu tuần 1 - Ngày 2</Button>
      </div>
    </div>
  );
};

export default Day1IntroPage;
