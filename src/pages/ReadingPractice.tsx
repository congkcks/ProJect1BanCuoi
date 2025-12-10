import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ChevronRight, ChevronLeft, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useReadingPractice } from "@/hooks/useReadingPractice";

const ReadingPractice = () => {
  const navigate = useNavigate();
  const {
    lesson,
    currentStep,
    userAnswers,
    showResults,
    nextStep,
    prevStep,
    submitAnswer,
    checkAnswers,
  } = useReadingPractice();

  useEffect(() => {
    if (!lesson) {
      navigate("/reading-config");
    }
  }, [lesson, navigate]);

  if (!lesson) {
    return null;
  }

  const progress = ((currentStep + 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/reading-config")}
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
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">{lesson.meta.title}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="secondary">{lesson.meta.level}</Badge>
              <span>•</span>
              <span>{lesson.meta.topic}</span>
              <span>•</span>
              <span>{lesson.meta.words} từ</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">
              Bước {currentStep + 1}/3: {
                currentStep === 0 ? "Pre-Reading" :
                currentStep === 1 ? "Reading" :
                "Post-Reading"
              }
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <div className="space-y-6">
            {/* Warmup Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Câu Hỏi Khởi Động</CardTitle>
                <CardDescription>Suy nghĩ về những câu hỏi này trước khi đọc</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson.pre_reading.warmup_questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-medium">
                      {idx + 1}. {q}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Vocabulary */}
            <Card>
              <CardHeader>
                <CardTitle>Từ Vựng Quan Trọng</CardTitle>
                <CardDescription>Học các từ vựng này trước khi đọc bài</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {lesson.pre_reading.key_vocab.map((vocab, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">{vocab.word}</span>
                        <Badge variant="outline">{vocab.pos}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Nghĩa:</span> {vocab.meaning_vi}
                      </p>
                      <p className="text-sm italic">
                        <span className="font-medium">Ví dụ:</span> {vocab.example_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Bài Đọc</CardTitle>
              <CardDescription>Đọc kỹ bài văn sau</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.text.paragraphs.map((para, idx) => (
                <p key={idx} className="text-lg leading-relaxed">
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle>Câu Hỏi Kiểm Tra</CardTitle>
                <CardDescription>Trả lời các câu hỏi sau về bài đọc</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {lesson.post_reading.quizzes.map((quiz, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3">
                    <p className="font-medium">
                      {idx + 1}. {quiz.question}
                    </p>

                    {quiz.type === 'mcq' && quiz.options && (
                      <div className="space-y-2">
                        {quiz.options.map((option, optIdx) => (
                          <Button
                            key={optIdx}
                            variant={userAnswers[idx] === option[0] ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => submitAnswer(idx, option[0])}
                            disabled={showResults}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}

                    {quiz.type === 'tf' && (
                      <div className="flex gap-3">
                        <Button
                          variant={userAnswers[idx] === true ? "default" : "outline"}
                          onClick={() => submitAnswer(idx, true)}
                          disabled={showResults}
                          className="flex-1"
                        >
                          Đúng
                        </Button>
                        <Button
                          variant={userAnswers[idx] === false ? "default" : "outline"}
                          onClick={() => submitAnswer(idx, false)}
                          disabled={showResults}
                          className="flex-1"
                        >
                          Sai
                        </Button>
                      </div>
                    )}

                    {quiz.type === 'gapfill' && (
                      <Input
                        placeholder="Nhập câu trả lời..."
                        value={(userAnswers[idx] as string) || ""}
                        onChange={(e) => submitAnswer(idx, e.target.value)}
                        disabled={showResults}
                      />
                    )}

                    {showResults && quiz.explanation && (
                      <div className={`p-3 rounded-lg ${
                        (quiz.type === 'mcq' && userAnswers[idx] === quiz.correct) ||
                        (quiz.type === 'tf' && userAnswers[idx] === quiz.answer) ||
                        (quiz.type === 'gapfill' && 
                         typeof userAnswers[idx] === 'string' &&
                         (userAnswers[idx] as string).toLowerCase().trim() === 
                         quiz.answer?.toString().toLowerCase().trim())
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-red-500/10 text-red-700 dark:text-red-400'
                      }`}>
                        <p className="text-sm">{quiz.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                {!showResults && (
                  <Button onClick={checkAnswers} className="w-full" size="lg">
                    <Check className="w-5 h-5 mr-2" />
                    Kiểm Tra Câu Trả Lời
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Summary Task */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm Tắt Bài Đọc</CardTitle>
                <CardDescription>{lesson.post_reading.summary_task}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Viết tóm tắt của bạn tại đây..."
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Vocab Review */}
            <Card>
              <CardHeader>
                <CardTitle>Ôn Tập Từ Vựng</CardTitle>
                <CardDescription>Hãy chắc chắn bạn nhớ các từ này</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lesson.post_reading.vocab_review.map((word, idx) => (
                    <Badge key={idx} variant="secondary" className="text-base py-1 px-3">
                      {word}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay Lại
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === 2}
          >
            Tiếp Theo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReadingPractice;
