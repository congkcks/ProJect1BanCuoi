import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { testApi } from "@/lib/api";
import { QuestionDisplay } from "@/components/test/QuestionDisplay";
import { TestTimer } from "@/components/test/TestTimer";
import { ProgressTracker } from "@/components/test/ProgressTracker";
import { GuestReviewList } from "@/components/test/GuestReviewList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserAnswer } from "@/types/test";

const Test = () => {
  const { testId } = useParams<{ testId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Kiểm tra email từ localStorage - nếu có thì dùng, không thì guest mode
  const storedEmail = localStorage.getItem("userEmail");
  const userEmail = storedEmail;
  const isGuestMode = !userEmail;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [guestScore, setGuestScore] = useState<number | null>(null);

  // Helper functions for media URLs
  const getAudioEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const fileIdMatch = url.match(/\/d\/(.+?)\//);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return null;
  };

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
  const { data: testDetail, isLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => testApi.getTestDetail(testId!),
    enabled: !!testId,
  });

  useEffect(() => {
    const startSession = async () => {
      // Only start session if user is logged in (not guest mode)
      if (testId && !sessionId && !isGuestMode && userEmail) {
        try {
          console.log("Starting session with:", { userEmail, testId });
          const session = await testApi.startSession(
            userEmail,
            testId
          );
          console.log("Session started:", session);
          setSessionId(session.sessionId);
          toast({
            title: "Session Started",
            description: "Your test session has begun!",
          });
        } catch (error) {
          console.error("Failed to start session:", error);
          toast({
            title: "Error",
            description: "Failed to start test session",
            variant: "destructive",
          });
        }
      }
    };
    startSession();
  }, [testId, sessionId, userEmail, isGuestMode, toast]);

  // Store email in localStorage for history page
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
  }, [userEmail]);

  const handleAnswer = (questionId: number, answer: string) => {
    setUserAnswers((prev) => new Map(prev).set(questionId, answer));
  };

  const calculateScore = () => {
    if (!testDetail) return 0;

    let correctAnswers = 0;
    testDetail.questions.forEach((question) => {
      const userAnswer = userAnswers.get(question.questionId);
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    // Simple score calculation (can be adjusted)
    const percentage = (correctAnswers / testDetail.totalQuestions) * 100;
    return Math.round((percentage / 100) * 990); // TOEIC score range approximation
  };

  const handleSubmit = async () => {
    if (!testDetail) return;

    setIsSubmitting(true);
    const score = calculateScore();

    // Guest mode - show review with answers without saving
    if (isGuestMode) {
      setGuestScore(score);
      setIsReviewMode(true);
      setCurrentQuestionIndex(0);
      toast({
        title: "Hoàn thành!",
        description: `Điểm số: ${score} - Xem đáp án bên dưới`,
      });
      setIsSubmitting(false);
      setShowSubmitDialog(false);
      return;
    }

    // Logged in user - save results
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active session found",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit score
      await testApi.submitResult(sessionId, score);

      // Submit answers
      const answersArray = testDetail.questions.map((question) => ({
        sessionId,
        questionId: question.questionId,
        selectedOption: userAnswers.get(question.questionId) || "",
        isCorrect: userAnswers.get(question.questionId) === question.correctAnswer,
      }));

      await testApi.submitAnswers(answersArray);

      toast({
        title: "Success!",
        description: `Your score: ${score}`,
      });

      // Navigate to review page
      navigate(`/review/${sessionId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit test results",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "Submitting your test automatically...",
    });
    handleSubmit();
  };

  const handleRetry = () => {
    setUserAnswers(new Map());
    setCurrentQuestionIndex(0);
    setIsReviewMode(false);
    setGuestScore(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Test not found</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show GuestReviewList component when in review mode for guest users
  if (isReviewMode && guestScore !== null && isGuestMode) {
    return (
      <GuestReviewList
        questions={testDetail.questions}
        userAnswers={userAnswers}
        score={guestScore}
        testTitle={testDetail.title}
        onRetry={handleRetry}
      />
    );
  }

  const currentQuestion = testDetail.questions[currentQuestionIndex];
  const answeredCount = userAnswers.size;


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
            <h1 className="text-xl font-bold">{testDetail.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              {isGuestMode ? (
                <div className="px-3 py-1.5 rounded-full bg-warning/10 text-warning">
                  <span className="font-medium">Chế độ khách (không lưu)</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  <span className="font-medium">{userEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Guest Score Card - Show when in review mode */}
            {isReviewMode && guestScore !== null && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-primary mb-2">Điểm của bạn</h3>
                  <p className="text-3xl font-bold text-primary">{guestScore}</p>
                  <p className="text-sm text-muted-foreground mt-1">/ 990</p>
                </CardContent>
              </Card>
            )}

            {!isReviewMode && (
              <TestTimer duration={testDetail.duration} onTimeUp={handleTimeUp} />
            )}
            <ProgressTracker
              totalQuestions={testDetail.totalQuestions}
              answeredQuestions={answeredCount}
              currentQuestion={currentQuestionIndex + 1}
            />

            {/* Question Navigator */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {testDetail.questions.map((q, idx) => {
                    const userAnswer = userAnswers.get(q.questionId);
                    const isCorrect = userAnswer === q.correctAnswer;
                    const isAnswered = userAnswers.has(q.questionId);

                    return (
                      <button
                        key={q.questionId}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`
                          aspect-square rounded-md text-sm font-medium transition-all
                          ${idx === currentQuestionIndex
                            ? 'ring-2 ring-primary ring-offset-2'
                            : ''
                          }
                          ${isReviewMode
                            ? isAnswered
                              ? isCorrect
                                ? 'bg-emerald-500 text-white font-bold shadow-md'
                                : 'bg-red-500 text-white font-bold shadow-md'
                              : 'bg-muted text-muted-foreground'
                            : idx === currentQuestionIndex
                              ? 'bg-primary text-primary-foreground'
                              : isAnswered
                                ? 'bg-emerald-500 text-white font-bold shadow-md'
                                : 'bg-muted hover:bg-muted/80'
                          }
                        `}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Review Mode Banner */}
            {isReviewMode && (
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-warning">Chế độ xem đáp án</h3>
                    <p className="text-sm text-muted-foreground">Kết quả không được lưu trong chế độ khách</p>
                  </div>
                  <Button onClick={() => navigate("/")} variant="outline">
                    Về trang chủ
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Question Display with Review Mode */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Câu {currentQuestionIndex + 1} / {testDetail.totalQuestions} (Part {currentQuestion.part})</span>
                </div>

                {/* Audio Player */}
                {currentQuestion.audioUrl && getAudioEmbedUrl(currentQuestion.audioUrl) && (
                  <div className="w-full">
                    <iframe
                      src={getAudioEmbedUrl(currentQuestion.audioUrl)!}
                      className="w-full h-[52px] border border-border rounded-lg"
                      allow="autoplay"
                    />
                  </div>
                )}

                {/* Passage Text */}
                {currentQuestion.passageText && (
                  <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                    <p className="text-sm whitespace-pre-wrap">{currentQuestion.passageText}</p>
                  </div>
                )}

                {/* Image Display */}
                {currentQuestion.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={getImageUrl(currentQuestion.imageUrl)}
                      alt={`Question ${currentQuestion.questionNumber}`}
                      className="max-w-full h-auto rounded-lg border-2 border-border shadow-md"
                      onError={(e) => {
                        console.error("Image load error:", e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Question Text */}
                {currentQuestion.questionText && (
                  <p className="text-lg font-medium">{currentQuestion.questionText}</p>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = userAnswers.get(currentQuestion.questionId) === option.label;
                    const isCorrectAnswer = currentQuestion.correctAnswer === option.label;

                    return (
                      <button
                        key={option.label}
                        onClick={() => !isReviewMode && handleAnswer(currentQuestion.questionId, option.label)}
                        disabled={isReviewMode}
                        className={`
                          w-full p-4 rounded-lg border text-left transition-all
                          ${isReviewMode
                            ? isCorrectAnswer
                              ? 'border-success bg-success/10 text-success'
                              : isSelected
                                ? 'border-destructive bg-destructive/10 text-destructive'
                                : 'border-border bg-muted/30'
                            : isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }
                        `}
                      >
                        <span className="font-medium mr-2">{option.label}.</span>
                        {option.text || `Option ${option.label}`}
                        {isReviewMode && isCorrectAnswer && (
                          <span className="ml-2 text-success font-medium">(Đáp án đúng)</span>
                        )}
                        {isReviewMode && isSelected && !isCorrectAnswer && (
                          <span className="ml-2 text-destructive font-medium">(Bạn chọn)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Explanation for current question in review mode */}
            {isReviewMode && currentQuestion.explanation && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-primary mb-2">Giải thích:</h4>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Full Answer List in Review Mode */}
            {isReviewMode && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Bảng tổng hợp đáp án</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {testDetail.questions.map((q, idx) => {
                      const userAnswer = userAnswers.get(q.questionId);
                      const isCorrect = userAnswer === q.correctAnswer;
                      const userOption = q.options.find(o => o.label === userAnswer);
                      const correctOption = q.options.find(o => o.label === q.correctAnswer);

                      return (
                        <div
                          key={q.questionId}
                          className={`p-4 rounded-lg border-2 ${isCorrect
                            ? 'border-success/30 bg-success/5'
                            : 'border-destructive/30 bg-destructive/5'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold">
                              Câu {idx + 1} (Part {q.part})
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${isCorrect
                              ? 'bg-success text-success-foreground'
                              : 'bg-destructive text-destructive-foreground'
                              }`}>
                              {isCorrect ? 'Đúng' : 'Sai'}
                            </span>
                          </div>

                          {q.questionText && (
                            <p className="text-sm mb-2 text-muted-foreground">{q.questionText}</p>
                          )}

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
                                {q.correctAnswer}. {correctOption?.text || ''}
                              </span>
                            </div>
                          </div>

                          {q.explanation && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <span className="font-medium text-primary text-sm">Giải thích: </span>
                              <span className="text-sm text-muted-foreground">{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>

              {isReviewMode ? (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) =>
                    Math.min(testDetail.questions.length - 1, prev + 1)
                  )}
                  disabled={currentQuestionIndex === testDetail.questions.length - 1}
                  className="gap-2"
                >
                  Tiếp
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : currentQuestionIndex === testDetail.questions.length - 1 ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="gap-2 bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4" />
                  Nộp bài
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) =>
                    Math.min(testDetail.questions.length - 1, prev + 1)
                  )}
                  className="gap-2"
                >
                  Tiếp
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {testDetail.totalQuestions} questions.
              {answeredCount < testDetail.totalQuestions && (
                <span className="block mt-2 text-warning font-medium">
                  Warning: You have {testDetail.totalQuestions - answeredCount} unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Test;
