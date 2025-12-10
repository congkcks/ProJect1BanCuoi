import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useReadingPractice } from "@/hooks/useReadingPractice";

const ReadingConfiguration = () => {
  const navigate = useNavigate();
  const { generateLesson, isLoading } = useReadingPractice();
  
  const [level, setLevel] = useState("Intermediate");
  const [topic, setTopic] = useState("");
  const [targetWords, setTargetWords] = useState(200);

  const levels = [
    { value: "Beginner", label: "Beginner (A1-A2)" },
    { value: "Intermediate", label: "Intermediate (B1-B2)" },
    { value: "Advanced", label: "Advanced (C1-C2)" },
  ];

  const popularTopics = [
    "Technology and Innovation",
    "Environment and Climate",
    "Health and Lifestyle",
    "Education and Learning",
    "Travel and Culture",
    "Business and Economy",
    "Science and Discovery",
    "Arts and Entertainment",
  ];

  const handleStart = async () => {
    if (!topic.trim()) {
      return;
    }

    await generateLesson({
      Level: level,
      Topic: topic,
      TargetWords: targetWords,
      Locale: "en",
    });

    navigate("/reading-practice");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <Home className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Cấu Hình Bài Đọc</h1>
              <p className="text-muted-foreground">Tùy chỉnh bài đọc theo nhu cầu của bạn</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thiết Lập Bài Đọc</CardTitle>
            <CardDescription>
              Chọn cấp độ, chủ đề và độ dài bài đọc phù hợp với trình độ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="level">Cấp Độ</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Chủ Đề</Label>
              <Input
                id="topic"
                placeholder="Nhập chủ đề bạn muốn học..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {popularTopics.map((t) => (
                  <Button
                    key={t}
                    variant="outline"
                    size="sm"
                    onClick={() => setTopic(t)}
                    className="text-xs"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="words">Số Từ Mục Tiêu</Label>
              <Select
                value={targetWords.toString()}
                onValueChange={(v) => setTargetWords(Number(v))}
              >
                <SelectTrigger id="words">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="150">150 từ (Ngắn)</SelectItem>
                  <SelectItem value="200">200 từ (Trung bình)</SelectItem>
                  <SelectItem value="250">250 từ (Dài)</SelectItem>
                  <SelectItem value="300">300 từ (Rất dài)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Đang tạo bài đọc..." : "Bắt Đầu Luyện Đọc"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReadingConfiguration;
