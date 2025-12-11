import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Question } from "@/types/test";

interface GuestReviewListProps {
  questions: Question[];
  userAnswers: Map<number, string>;
  score: number;
  testTitle: string;
  onRetry?: () => void;
}

export const GuestReviewList = ({ 
  questions, 
  userAnswers, 
  score, 
  testTitle,
  onRetry 
}: GuestReviewListProps) => {
  const navigate = useNavigate();

  const correctCount = questions.filter(q => userAnswers.get(q.questionId) === q.correctAnswer).length;
  const incorrectCount = questions.filter(q => {
    const answer = userAnswers.get(q.questionId);
    return answer && answer !== q.correctAnswer;
  }).length;
  const unansweredCount = questions.filter(q => !userAnswers.has(q.questionId)).length;

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http') && !url.includes('drive.google.com')) {
      return url;
    }
    const fileIdMatch = url.match(/\/d\/(.+?)\//);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
  };

  const getAudioEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const fileIdMatch = url.match(/\/d\/(.+?)\//);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-xl font-bold">{testTitle} - Kết quả</h1>
            <div className="px-3 py-1.5 rounded-full bg-warning/10 text-warning">
              <span className="font-medium">Chế độ khách</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Score Summary */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">Kết quả bài thi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-3xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground">Điểm số</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-3xl font-bold text-success">{correctCount}</p>
                <p className="text-sm text-muted-foreground">Đúng</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10">
                <p className="text-3xl font-bold text-destructive">{incorrectCount}</p>
                <p className="text-sm text-muted-foreground">Sai</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold text-muted-foreground">{unansweredCount}</p>
                <p className="text-sm text-muted-foreground">Bỏ qua</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Về trang chủ
              </Button>
              {onRetry && (
                <Button onClick={onRetry} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Làm lại
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question, idx) => {
            const userAnswer = userAnswers.get(question.questionId);
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswers.has(question.questionId);
            const userOption = question.options.find(o => o.label === userAnswer);
            const correctOption = question.options.find(o => o.label === question.correctAnswer);

            return (
              <Card 
                key={question.questionId}
                className={`border-2 ${
                  !isAnswered 
                    ? 'border-muted' 
                    : isCorrect 
                      ? 'border-success/30' 
                      : 'border-destructive/30'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Câu {idx + 1} (Part {question.part})
                    </CardTitle>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      !isAnswered
                        ? 'bg-muted text-muted-foreground'
                        : isCorrect 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {!isAnswered ? (
                        'Bỏ qua'
                      ) : isCorrect ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Đúng
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Sai
                        </>
                      )}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Audio */}
                  {question.audioUrl && getAudioEmbedUrl(question.audioUrl) && (
                    <iframe
                      src={getAudioEmbedUrl(question.audioUrl)!}
                      className="w-full h-[52px] border border-border rounded-lg"
                      allow="autoplay"
                    />
                  )}

                  {/* Passage */}
                  {question.passageText && (
                    <div className="p-3 bg-accent/50 rounded-lg border border-accent">
                      <p className="text-sm whitespace-pre-wrap">{question.passageText}</p>
                    </div>
                  )}

                  {/* Image */}
                  {question.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={getImageUrl(question.imageUrl)}
                        alt={`Question ${question.questionNumber}`}
                        className="max-w-full max-h-[300px] h-auto rounded-lg border-2 border-border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Question Text */}
                  {question.questionText && (
                    <p className="font-medium">{question.questionText}</p>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isUserAnswer = option.label === userAnswer;
                      const isCorrectOption = option.label === question.correctAnswer;

                      return (
                        <div
                          key={option.label}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectOption
                              ? 'border-success bg-success/10'
                              : isUserAnswer
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border bg-muted/30'
                          }`}
                        >
                          <span className="font-medium mr-2">{option.label}.</span>
                          {option.text || `Option ${option.label}`}
                          {isCorrectOption && (
                            <span className="ml-2 text-success font-medium">(Đáp án đúng)</span>
                          )}
                          {isUserAnswer && !isCorrectOption && (
                            <span className="ml-2 text-destructive font-medium">(Bạn chọn)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer Summary */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Bạn chọn: </span>
                        <span className={userAnswer ? (isCorrect ? 'text-success' : 'text-destructive') : 'text-muted-foreground'}>
                          {userAnswer 
                            ? `${userAnswer}. ${userOption?.text || ''}` 
                            : 'Chưa trả lời'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Đáp án đúng: </span>
                        <span className="text-success">
                          {question.correctAnswer}. {correctOption?.text || ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <span className="font-semibold text-primary">Giải thích: </span>
                      <span className="text-sm">{question.explanation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-8 pb-8">
          <Button onClick={() => navigate("/")} variant="outline" size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
          {onRetry && (
            <Button onClick={onRetry} size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Làm lại bài
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
