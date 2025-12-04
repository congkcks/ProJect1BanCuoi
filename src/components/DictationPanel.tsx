import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play, RotateCcw, Eye, Mic } from "lucide-react";
import { Sentence } from "@/types/api";

interface DictationPanelProps {
  sentences: Sentence[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onPlaySentence: (sentence: Sentence) => void;
  level: string;
}

export const DictationPanel = ({
  sentences,
  currentIndex,
  onIndexChange,
  onPlaySentence,
  level,
}: DictationPanelProps) => {
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    const windowAny = window as any;
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionAPI = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = () => setIsRecording(false);
      recognitionInstance.onend = () => setIsRecording(false);

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      onIndexChange(currentIndex + 1);
      setUserInput("");
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      setUserInput("");
      setShowAnswer(false);
    }
  };

  if (!currentSentence) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground">Chép chính tả</h3>
        <Badge className="bg-level-b1 text-white border-0">{level}</Badge>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onPlaySentence(currentSentence)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" onClick={() => onPlaySentence(currentSentence)}>
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === sentences.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">{currentIndex + 1} / {sentences.length}</span>
      </div>

      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-2 block">Gõ những gì bạn nghe được:</label>
        <div className="relative">
          <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Gõ câu trả lời..." className="min-h-[100px] pr-12" />
          <Button variant="ghost" size="icon" className={`absolute bottom-2 right-2 ${isRecording ? "text-destructive" : ""}`} onClick={toggleRecording}>
            <Mic className={`h-5 w-5 ${isRecording ? "animate-pulse" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {currentSentence.english.split(" ").map((word, i) => (
          <span key={i} className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {showAnswer ? word : "*".repeat(word.length)}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        <Button variant="destructive" className="w-full" onClick={() => setShowAnswer(true)}>
          <Eye className="h-4 w-4 mr-2" />Hiện tất cả từ
        </Button>
        <Button variant="default" className="w-full" onClick={handleNext}>
          Tiếp theo<ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
