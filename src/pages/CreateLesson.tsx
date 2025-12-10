import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CreateLesson = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [level, setLevel] = useState(2);
  const [purpose, setPurpose] = useState("communication");
  const [method, setMethod] = useState("ai");
  const [topic, setTopic] = useState("");
  const [topicMode, setTopicMode] = useState<"preset" | "custom">("preset");
  const [manualContent, setManualContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple/10 to-primary/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            Tạo bài luyện viết mới
          </h1>
        </div>

        <div className="space-y-6">
          {/* Language and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2 text-sm">
                🌍 Ngôn ngữ
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 Tiếng Anh</SelectItem>
                  <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold mb-2 text-sm">
                📊 Độ khó
              </label>
              <Select value={level.toString()} onValueChange={(val) => setLevel(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🌱 Khá dễ (Level 1)</SelectItem>
                  <SelectItem value="2">📈 Trung bình (Level 2)</SelectItem>
                  <SelectItem value="3">🔥 Khó (Level 3)</SelectItem>
                  <SelectItem value="4">🚀 Nâng cao (Level 4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="flex items-center gap-2 font-semibold mb-3 text-sm">
              🎯 Mục đích học
            </label>
            <RadioGroup value={purpose} onValueChange={setPurpose} className="grid grid-cols-3 gap-3">
              <div>
                <RadioGroupItem value="communication" id="communication" className="peer sr-only" />
                <Label
                  htmlFor="communication"
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 cursor-pointer"
                >
                  💬 Giao tiếp
                </Label>
              </div>
              <div>
                <RadioGroupItem value="ielts" id="ielts" className="peer sr-only" />
                <Label
                  htmlFor="ielts"
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                >
                  🎓 IELTS
                </Label>
              </div>
              <div>
                <RadioGroupItem value="work" id="work" className="peer sr-only" />
                <Label
                  htmlFor="work"
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                >
                  💼 Công việc
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Creation Method */}
          <div>
            <label className="flex items-center gap-2 font-semibold mb-3 text-sm">
              📝 Cách tạo bài
            </label>
            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="ai" id="ai" className="peer sr-only" />
                <Label
                  htmlFor="ai"
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-info/20 cursor-pointer"
                >
                  🤖 AI tạo từ chủ đề
                </Label>
              </div>
              <div>
                <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
                <Label
                  htmlFor="manual"
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-warning peer-data-[state=checked]:bg-warning/20 cursor-pointer"
                >
                  ✍️ Tự nhập đoạn văn
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Topic Selection */}
          {method === "ai" && (
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2 text-sm">
                📚 Chủ đề
              </label>
              
              {/* Topic input mode toggle */}
              <RadioGroup value={topicMode} onValueChange={(val) => setTopicMode(val as "preset" | "custom")} className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <RadioGroupItem value="preset" id="preset" className="peer sr-only" />
                  <Label
                    htmlFor="preset"
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                  >
                    📋 Chọn chủ đề có sẵn
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                  <Label
                    htmlFor="custom"
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                  >
                    ✏️ Tự nhập chủ đề
                  </Label>
                </div>
              </RadioGroup>

              {topicMode === "preset" ? (
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn một chủ đề..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="The Importance of Learning English">🌍 The Importance of Learning English</SelectItem>
                    <SelectItem value="My Favorite Place to Relax">🏖️ My Favorite Place to Relax</SelectItem>
                    <SelectItem value="Benefits of Reading Books">📚 Benefits of Reading Books</SelectItem>
                    <SelectItem value="Technology in Modern Life">💻 Technology in Modern Life</SelectItem>
                    <SelectItem value="Environmental Protection">🌱 Environmental Protection</SelectItem>
                    <SelectItem value="The Value of Friendship">🤝 The Value of Friendship</SelectItem>
                    <SelectItem value="My Dream Job">💼 My Dream Job</SelectItem>
                    <SelectItem value="Healthy Lifestyle Habits">🏃 Healthy Lifestyle Habits</SelectItem>
                    <SelectItem value="Travel and Cultural Exchange">✈️ Travel and Cultural Exchange</SelectItem>
                    <SelectItem value="The Role of Social Media">📱 The Role of Social Media</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  placeholder="Nhập chủ đề của bạn... (ví dụ: My childhood memories, The future of education)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[80px]"
                />
              )}
            </div>
          )}

          {/* Manual Input */}
          {method === "manual" && (
            <div>
              <label className="flex items-center gap-2 font-semibold mb-2 text-sm">
                ✍️ Nhập đoạn văn
              </label>
              <Textarea
                placeholder="Nhập nội dung bài học của bạn..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button 
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-lg font-semibold"
            onClick={handleGenerateTopic}
            disabled={isGenerating || (method === "ai" && !topic.trim())}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang tạo đề...
              </>
            ) : (
              <>✏️ Bắt đầu luyện viết</>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

  async function handleGenerateTopic() {
    if (method === "ai" && !topic.trim()) {
      toast.error("Vui lòng nhập chủ đề!");
      return;
    }

    setIsGenerating(true);
    try {
      const purposeMap = {
        communication: "Conversation practice",
        ielts: "Essay writing",
        work: "Professional writing"
      };

      const response = await fetch("https://btl-d39f.onrender.com/api/WritingAi/GenerateTopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Language: language === "en" ? "English" : "Vietnamese",
          Level: level,
          Purpose: purposeMap[purpose as keyof typeof purposeMap],
          Topic: method === "ai" ? topic : manualContent,
          CreationMode: "Practice"
        })
      });

      if (!response.ok) throw new Error("Failed to generate topic");
      
      // Parse text/plain response to JSON
      const textResponse = await response.text();
      console.log("Raw API Response:", textResponse);
      
      let data;
      try {
        // Try to parse as JSON directly
        data = JSON.parse(textResponse);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from text
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid response format");
        }
      }
      
      console.log("Parsed Data:", data);
      
      // Navigate to writing practice with generated data
      navigate("/writing-practice", { 
        state: { 
          generatedData: data,
          level,
          language
        } 
      });
      
      toast.success("Đề bài đã được tạo!");
    } catch (error) {
      console.error("Error generating topic:", error);
      toast.error("Không thể tạo đề bài. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  }
};

export default CreateLesson;