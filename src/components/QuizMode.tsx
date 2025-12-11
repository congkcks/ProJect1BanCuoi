import { useState, useEffect } from "react";
import { Flashcard } from "@/types/flashcard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, X, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface QuizModeProps {
  flashcards: Flashcard[];
  onComplete: () => void;
}

export const QuizMode = ({ flashcards, onComplete }: QuizModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const getHint = () => {
    const word = currentCard.englishWord;
    const firstLetter = word[0];
    const lastLetter = word[word.length - 1];
    const middleLength = word.length - 2;
    return `${firstLetter}${"_".repeat(middleLength)}${lastLetter}`;
  };

  const checkAnswer = () => {
    const correct =
      userAnswer.toLowerCase().trim() === currentCard.englishWord.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      toast.success("Chính xác! 🎉");
    } else {
      toast.error("Sai rồi! Hãy xem đáp án bên dưới");
    }
  };

  const nextQuestion = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowHint(false);
      setIsCorrect(null);
    } else {
      toast.success(`Hoàn thành! Điểm số: ${score + (isCorrect ? 1 : 0)}/${flashcards.length}`);
      onComplete();
    }
  };

  useEffect(() => {
    setUserAnswer("");
    setShowHint(false);
    setIsCorrect(null);
  }, [currentIndex]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Câu {currentIndex + 1} / {flashcards.length}
          </span>
          <span>
            Điểm: {score}/{flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Từ tiếng Anh tương ứng là gì?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary mb-2">
              {currentCard.vietnameseMeaning}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {currentCard.exampleSentenceVi}
            </p>
          </div>

            <div className="space-y-4">
            <div className="relative">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isCorrect === null) {
                    checkAnswer();
                  } else if (e.key === "Enter" && isCorrect !== null) {
                    nextQuestion();
                  }
                }}
                placeholder="Nhập từ tiếng Anh..."
                disabled={isCorrect !== null}
                className="text-lg h-12"
              />
              {isCorrect === true && (
                <Check className="absolute right-3 top-3 h-6 w-6 text-success" />
              )}
              {isCorrect === false && (
                <X className="absolute right-3 top-3 h-6 w-6 text-destructive" />
              )}
            </div>

            {/* Show correct answer when wrong */}
            {isCorrect === false && (
              <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-2">
                      Đáp án đúng:
                    </p>
                    <p className="text-2xl font-bold text-foreground mb-2">
                      {currentCard.englishWord}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentCard.phonetic}
                    </p>
                    <div className="mt-3 pt-3 border-t border-destructive/20">
                      <p className="text-sm text-foreground">
                        {currentCard.exampleSentenceEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show success message when correct */}
            {isCorrect === true && (
              <div className="bg-success/10 border-2 border-success/20 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-success">Chính xác! 🎉</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentCard.exampleSentenceEn}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showHint && isCorrect === null && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <p className="text-sm font-medium text-accent">Gợi ý:</p>
                </div>
                <p className="text-center font-mono text-2xl tracking-wider text-foreground">
                  {getHint()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {isCorrect === null ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    disabled={showHint}
                    className="flex-1"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Gợi ý
                  </Button>
                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="flex-1"
                  >
                    Kiểm tra
                  </Button>
                </>
              ) : (
                <Button onClick={nextQuestion} className="w-full">
                  {currentIndex < flashcards.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
