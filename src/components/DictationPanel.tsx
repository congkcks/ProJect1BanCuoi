import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play, RotateCcw, Eye, Mic, Check, X } from "lucide-react";
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
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      onIndexChange(currentIndex + 1);
      setUserInput("");
      setShowAnswer(false);
      setIsSubmitted(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      setUserInput("");
      setShowAnswer(false);
      setIsSubmitted(false);
    }
  };

  const compareAnswer = () => {
    if (!currentSentence || !userInput) return null;
    const correct = currentSentence.english.toLowerCase().trim();
    const user = userInput.toLowerCase().trim();
    return correct === user;
  };

  if (!currentSentence) return null;

  const isCorrect = isSubmitted ? compareAnswer() : null;

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
        <span className="text-sm text-muted-foreground">
          {currentSentence.startTime}s - {currentSentence.endTime}s | {currentIndex + 1} / {sentences.length}
        </span>
      </div>

      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-2 block">Gõ những gì bạn nghe được:</label>
        <div className="relative">
          <Textarea 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} 
            placeholder="Gõ câu trả lời..." 
            className="min-h-[80px] pr-12"
            disabled={isSubmitted}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute bottom-2 right-2 ${isRecording ? "text-destructive" : ""}`} 
            onClick={toggleRecording}
            disabled={isSubmitted}
          >
            <Mic className={`h-5 w-5 ${isRecording ? "animate-pulse" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Word hints */}
      {!showAnswer && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentSentence.english.split(" ").map((word, i) => (
            <span key={i} className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {"*".repeat(word.length)}
            </span>
          ))}
        </div>
      )}

      {/* Answer section - shown after submit */}
      {isSubmitted && (
        <div className={`p-4 rounded-lg mb-4 ${isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
            <span className={`font-medium ${isCorrect ? "text-green-500" : "text-red-500"}`}>
              {isCorrect ? "Chính xác!" : "Chưa đúng"}
            </span>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Đáp án:</span>
              <p className="text-card-foreground font-medium">{currentSentence.english}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Dịch nghĩa:</span>
              <p className="text-primary">{currentSentence.vietnamese}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {!isSubmitted ? (
          <>
            <Button variant="default" className="w-full" onClick={handleSubmit} disabled={!userInput.trim()}>
              <Check className="h-4 w-4 mr-2" />Kiểm tra đáp án
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowAnswer(true)}>
              <Eye className="h-4 w-4 mr-2" />Hiện đáp án
            </Button>
          </>
        ) : (
          <Button variant="default" className="w-full" onClick={handleNext} disabled={currentIndex === sentences.length - 1}>
            Tiếp theo<ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
