import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToeicTestDetail } from "@/hooks/useToeicTestDetail";
import { ToeicUserAnswer } from "@/types/toeic";
import { Clock, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TextWithWordTooltip } from "@/components/TextWithWordTooltip";

const ToeicTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { data: test, isLoading } = useToeicTestDetail(testId ? parseInt(testId) : null);
  
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (test) {
      setTimeLeft(test.duration_minutes * 60);
    }
  }, [test]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showResults]);

  const handleAnswerChange = (questionNo: number, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionNo]: option,
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    const allQuestions = test?.parts.flatMap(part => part.questions) || [];
    const correctCount = allQuestions.filter(q => 
      userAnswers[q.questionNo] === q.correctOption
    ).length;
    
    toast({
      title: "Hoàn thành bài thi",
      description: `Bạn đã trả lời đúng ${correctCount}/${allQuestions.length} câu hỏi`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Không tìm thấy đề thi</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const allQuestions = test.parts.flatMap(part => part.questions);
  const answeredCount = Object.keys(userAnswers).length;
  const progress = (answeredCount / allQuestions.length) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">{test.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-14">
            <span>Câu hỏi: {answeredCount}/{allQuestions.length}</span>
            <Progress value={progress} className="w-32" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="w-5 h-5" />
            <span className={timeLeft < 300 ? "text-destructive" : ""}>
              {formatTime(timeLeft)}
            </span>
          </div>
          {!showResults && (
            <Button onClick={handleSubmit}>Nộp bài</Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {test.parts.map((part) => (
          <Card key={part.partNo}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Part {part.partNo}</Badge>
                {part.description}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {part.partNo === 6 ? (
                // Part 6: Hiển thị passage kèm với các câu hỏi tương ứng
                part.passages.map((passage, idx) => {
                  // Lấy các số câu hỏi từ passageText (ví dụ: (31), (135))
                  const questionNumbers = passage.passageText.match(/\((\d+)\)/g)?.map(match => 
                    parseInt(match.replace(/[()]/g, ''))
                  ) || [];
                  
                  // Lọc các câu hỏi thuộc passage này
                  const passageQuestions = part.questions.filter(q => 
                    questionNumbers.includes(q.questionNo)
                  ).sort((a, b) => a.questionNo - b.questionNo);

                  return (
                    <div key={idx} className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">{passage.title}</h3>
                        <div className="whitespace-pre-wrap text-sm">
                          <TextWithWordTooltip text={passage.passageText} />
                        </div>
                      </div>

                      {passageQuestions.map((question) => {
                        const isCorrect = showResults && userAnswers[question.questionNo] === question.correctOption;
                        const isIncorrect = showResults && userAnswers[question.questionNo] && userAnswers[question.questionNo] !== question.correctOption;

                        return (
                          <div key={question.questionNo} className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-primary">Câu {question.questionNo}.</span>
                              <div className="flex-1">
                                <TextWithWordTooltip text={question.questionText} />
                              </div>
                              {showResults && (
                                isCorrect ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : isIncorrect ? (
                                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                ) : null
                              )}
                            </div>

                            <RadioGroup
                              value={userAnswers[question.questionNo] || ""}
                              onValueChange={(value) => handleAnswerChange(question.questionNo, value)}
                              disabled={showResults}
                            >
                              {["A", "B", "C", "D"].map((option) => {
                                const optionText = question[`option${option}` as keyof typeof question] as string;
                                const isSelected = userAnswers[question.questionNo] === option;
                                const isCorrectAnswer = showResults && question.correctOption === option;
                                
                                return (
                                  <div
                                    key={option}
                                    className={`flex items-center space-x-2 p-3 rounded ${
                                      isCorrectAnswer ? "bg-green-50 border-green-200 border" :
                                      isSelected && isIncorrect ? "bg-red-50 border-destructive border" :
                                      ""
                                    }`}
                                  >
                                    <RadioGroupItem value={option} id={`q${question.questionNo}-${option}`} />
                                    <Label
                                      htmlFor={`q${question.questionNo}-${option}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <span className="font-semibold mr-2">{option}.</span>
                                      {optionText}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                // Part 5 và Part 7: Hiển thị passages (nếu có) và questions bình thường
                <>
                  {part.passages.map((passage, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">{passage.title}</h3>
                        <div className="whitespace-pre-wrap text-sm">
                          <TextWithWordTooltip text={passage.passageText} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {part.questions.map((question) => {
                    const isCorrect = showResults && userAnswers[question.questionNo] === question.correctOption;
                    const isIncorrect = showResults && userAnswers[question.questionNo] && userAnswers[question.questionNo] !== question.correctOption;

                    return (
                      <div key={question.questionNo} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-primary">Câu {question.questionNo}.</span>
                          <div className="flex-1">
                            <TextWithWordTooltip text={question.questionText} />
                          </div>
                          {showResults && (
                        isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : isIncorrect ? (
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        ) : null
                      )}
                    </div>

                    <RadioGroup
                      value={userAnswers[question.questionNo] || ""}
                      onValueChange={(value) => handleAnswerChange(question.questionNo, value)}
                      disabled={showResults}
                    >
                      {["A", "B", "C", "D"].map((option) => {
                        const optionText = question[`option${option}` as keyof typeof question] as string;
                        const isSelected = userAnswers[question.questionNo] === option;
                        const isCorrectAnswer = showResults && question.correctOption === option;
                        
                        return (
                          <div
                            key={option}
                            className={`flex items-center space-x-2 p-3 rounded ${
                              isCorrectAnswer ? "bg-green-50 border-green-200 border" :
                              isSelected && isIncorrect ? "bg-red-50 border-destructive border" :
                              ""
                            }`}
                          >
                            <RadioGroupItem value={option} id={`q${question.questionNo}-${option}`} />
                            <Label
                              htmlFor={`q${question.questionNo}-${option}`}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-semibold mr-2">{option}.</span>
                              <TextWithWordTooltip text={optionText} />
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                    </div>
                  );
                })}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showResults && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Kết quả bài thi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">
                {allQuestions.filter(q => userAnswers[q.questionNo] === q.correctOption).length}/{allQuestions.length}
              </p>
              <p className="text-muted-foreground">câu trả lời đúng</p>
              <Button onClick={() => navigate("/toeic-tests")} className="mt-4">
                Quay lại danh sách đề thi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ToeicTest;
