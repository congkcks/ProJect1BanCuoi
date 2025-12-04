import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, RotateCcw, Mic, MicOff, Volume2, Check, X, RefreshCw } from "lucide-react";
import { Sentence } from "@/types/api";

interface ShadowingPanelProps {
  sentences: Sentence[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onPlaySentence: (sentence: Sentence) => void;
  level: string;
}

interface WordComparison {
  word: string;
  isCorrect: boolean;
  expected?: string;
}

export const ShadowingPanel = ({
  sentences,
  currentIndex,
  onIndexChange,
  onPlaySentence,
  level,
}: ShadowingPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [spokenText, setSpokenText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [wordComparison, setWordComparison] = useState<WordComparison[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    const windowAny = window as any;
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionAPI = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        evaluatePronunciation(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, []);

  const normalizeText = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s']/g, "")
      .split(/\s+/)
      .filter(word => word.length > 0);
  };

  const evaluatePronunciation = (spoken: string) => {
    if (!currentSentence) return;

    const expectedWords = normalizeText(currentSentence.english);
    const spokenWords = normalizeText(spoken);

    let correctCount = 0;
    const comparison: WordComparison[] = [];

    // Compare words using Levenshtein-like approach
    const maxLen = Math.max(expectedWords.length, spokenWords.length);
    
    for (let i = 0; i < expectedWords.length; i++) {
      const expected = expectedWords[i];
      const spoken = spokenWords[i] || "";
      
      // Check for exact match or close match (allowing small variations)
      const isCorrect = expected === spoken || 
        (spoken.length > 0 && levenshteinDistance(expected, spoken) <= Math.ceil(expected.length * 0.3));
      
      if (isCorrect) correctCount++;
      
      comparison.push({
        word: expected,
        isCorrect,
        expected: !isCorrect ? spoken : undefined
      });
    }

    // Add any extra spoken words
    for (let i = expectedWords.length; i < spokenWords.length; i++) {
      comparison.push({
        word: spokenWords[i],
        isCorrect: false,
        expected: "(thừa)"
      });
    }

    const calculatedScore = expectedWords.length > 0 
      ? Math.round((correctCount / expectedWords.length) * 100) 
      : 0;

    setScore(calculatedScore);
    setWordComparison(comparison);
    setAttempts(prev => prev + 1);
  };

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
        }
      }
    }

    return dp[m][n];
  };

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      setSpokenText("");
      setScore(null);
      setWordComparison([]);
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      onIndexChange(currentIndex + 1);
      resetState();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      resetState();
    }
  };

  const resetState = () => {
    setSpokenText("");
    setScore(null);
    setWordComparison([]);
    setAttempts(0);
  };

  const handleTryAgain = () => {
    setSpokenText("");
    setScore(null);
    setWordComparison([]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Xuất sắc! 🎉";
    if (score >= 80) return "Rất tốt! 👍";
    if (score >= 60) return "Khá tốt, cố gắng thêm!";
    if (score >= 40) return "Cần luyện tập thêm";
    return "Hãy thử lại nhé!";
  };

  if (!currentSentence) return null;

  if (!isSupported) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-center text-muted-foreground">
          <MicOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Trình duyệt không hỗ trợ Web Speech API.</p>
          <p className="text-sm mt-2">Vui lòng sử dụng Chrome hoặc Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground">🎤 Shadowing - Luyện phát âm</h3>
        <Badge className="bg-level-b1 text-white border-0">{level}</Badge>
      </div>

      {/* Navigation and controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onPlaySentence(currentSentence)}>
            <Volume2 className="h-4 w-4" />
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

      {/* Target sentence */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-xs text-muted-foreground mb-2">Nghe và nói theo:</p>
        <p className="text-lg font-medium text-foreground">{currentSentence.english}</p>
        <p className="text-sm text-primary mt-2">{currentSentence.vietnamese}</p>
      </div>

      {/* Recording button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleRecording}
          className={`relative w-24 h-24 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-destructive shadow-lg shadow-destructive/50 scale-110"
              : "bg-primary hover:bg-primary/90 hover:scale-105"
          }`}
        >
          {isRecording ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-white/30 animate-ping absolute" />
              <MicOff className="h-10 w-10 text-white relative z-10" />
            </div>
          ) : (
            <Mic className="h-10 w-10 text-white mx-auto" />
          )}
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mb-4">
        {isRecording ? "Đang nghe... Nhấn để dừng" : "Nhấn để bắt đầu nói"}
      </p>

      {/* Results */}
      {score !== null && (
        <div className="space-y-4">
          {/* Score display */}
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className={`text-sm mt-1 ${getScoreColor(score)}`}>
              {getScoreMessage(score)}
            </p>
            <Progress value={score} className="mt-3 h-2" />
          </div>

          {/* Spoken text */}
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Bạn đã nói:</p>
            <p className="text-foreground">{spokenText || "(Không nhận được)"}</p>
          </div>

          {/* Word comparison */}
          {wordComparison.length > 0 && (
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-3">Chi tiết từng từ:</p>
              <div className="flex flex-wrap gap-2">
                {wordComparison.map((item, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.isCorrect
                        ? "bg-green-500/20 text-green-500 border border-green-500/30"
                        : "bg-red-500/20 text-red-500 border border-red-500/30"
                    }`}
                  >
                    {item.isCorrect ? (
                      <Check className="h-3 w-3 inline mr-1" />
                    ) : (
                      <X className="h-3 w-3 inline mr-1" />
                    )}
                    {item.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleTryAgain}>
              <RefreshCw className="h-4 w-4 mr-2" />Thử lại
            </Button>
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={handleNext}
              disabled={currentIndex === sentences.length - 1}
            >
              Câu tiếp theo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Số lần thử: {attempts}
          </p>
        </div>
      )}
    </div>
  );
};
