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
  onComplete?: (index: number) => void;
}

export const DictationPanel = ({
  sentences,
  currentIndex,
  onIndexChange,
  onPlaySentence,
  level,
  onComplete,
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
    onComplete?.(currentIndex);
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
    if (!currentSentence || !userInput) return { isCorrect: false, correctCount: 0, totalCount: 0, wordResults: [] as { word: string; isCorrect: boolean }[] };

    const correctWords = currentSentence.english.toLowerCase().trim().split(/\s+/);
    const userWords = userInput.toLowerCase().trim().split(/\s+/);

    const wordResults = correctWords.map((word, index) => {
      const userWord = userWords[index] || "";
      // Remove punctuation for comparison
      const cleanCorrect = word.replace(/[^\w]/g, "");
      const cleanUser = userWord.replace(/[^\w]/g, "");
      return {
        word: correctWords[index] || word,
        isCorrect: cleanCorrect === cleanUser
      };
    });

    const correctCount = wordResults.filter(w => w.isCorrect).length;
    const isCorrect = correctCount === correctWords.length && userWords.length === correctWords.length;

    return { isCorrect, correctCount, totalCount: correctWords.length, wordResults };
  };

  const result = isSubmitted ? compareAnswer() : null;

  const handleShowAnswer = () => {
    setShowAnswer(true);
    onComplete?.(currentIndex);
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
      {isSubmitted && result && (
        <div className={`p-4 rounded-lg mb-4 ${result.isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-amber-500/10 border border-amber-500/30"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {result.isCorrect ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-amber-500" />
              )}
              <span className={`font-medium ${result.isCorrect ? "text-green-500" : "text-amber-500"}`}>
                {result.isCorrect ? "Chính xác!" : "Chưa đúng"}
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {result.correctCount}/{result.totalCount} từ đúng
            </span>
          </div>

          {/* Word by word comparison */}
          <div className="flex flex-wrap gap-1 mb-3">
            {result.wordResults.map((w, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded text-sm ${w.isCorrect
                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                    : "bg-red-500/20 text-red-600 dark:text-red-400"
                  }`}
              >
                {w.word}
              </span>
            ))}
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
            <Button variant="outline" className="w-full" onClick={handleShowAnswer}>
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
