import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Brain,
  Headphones,
  FileText,
  BookOpen,
  Trophy,
  RotateCcw
} from "lucide-react";
import { quizQuestions, courseRecommendations, Question } from "@/data/quizQuestions";
import LevelCard from "@/components/LevelCard";

const AssessmentQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(40).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(40).fill(null));
    setShowResults(false);
    setHasStarted(false);
  };

  const results = useMemo(() => {
    let correctCount = 0;
    let a1Correct = 0;
    let a2Correct = 0;
    let b1Correct = 0;
    let skippedCount = 0;

    selectedAnswers.forEach((answer, index) => {
      if (answer === null) {
        skippedCount++;
      } else if (answer === quizQuestions[index].correct) {
        correctCount++;
        const difficulty = quizQuestions[index].difficulty;
        if (difficulty === "a1") a1Correct++;
        else if (difficulty === "a2") a2Correct++;
        else if (difficulty === "b1") b1Correct++;
      }
    });

    const scorePercent = Math.round((correctCount / quizQuestions.length) * 100);

    // Determine level based on correct answers
    let recommendedLevel: "A1" | "A2" | "B1";
    if (correctCount <= 14) {
      recommendedLevel = "A1";
    } else if (correctCount <= 27) {
      recommendedLevel = "A2";
    } else {
      recommendedLevel = "B1";
    }

    return {
      correctCount,
      skippedCount,
      scorePercent,
      recommendedLevel,
      breakdown: {
        a1: { correct: a1Correct, total: 15 },
        a2: { correct: a2Correct, total: 13 },
        b1: { correct: b1Correct, total: 12 }
      }
    };
  }, [selectedAnswers]);

  const answeredCount = selectedAnswers.filter(a => a !== null).length;
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  const getTypeIcon = (type: Question["type"]) => {
    switch (type) {
      case "listening": return <Headphones className="w-4 h-4" />;
      case "reading": return <FileText className="w-4 h-4" />;
      case "vocabulary": return <BookOpen className="w-4 h-4" />;
      case "grammar": return <Brain className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Question["type"]) => {
    switch (type) {
      case "listening": return "Nghe";
      case "reading": return "Đọc";
      case "vocabulary": return "Từ vựng";
      case "grammar": return "Ngữ pháp";
    }
  };

  const getDifficultyColor = (difficulty: Question["difficulty"]) => {
    switch (difficulty) {
      case "a1": return "bg-toeic-success text-white";
      case "a2": return "bg-toeic-blue text-white";
      case "b1": return "bg-toeic-warning text-white";
    }
  };

  // Start Screen
  if (!hasStarted) {
    return (
      <section className="py-12 min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="text-center bg-card/70 border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <div className="mx-auto w-20 h-20 bg-toeic-blue/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-10 h-10 text-toeic-blue" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-toeic-navy">
                Bài kiểm tra đánh giá trình độ
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Hoàn thành 40 câu hỏi để xác định trình độ tiếng Anh của bạn
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="bg-toeic-success/5 border-toeic-success/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-toeic-success">40</div>
                    <p className="text-sm text-muted-foreground">Câu hỏi</p>
                  </CardContent>
                </Card>
                <Card className="bg-toeic-blue/5 border-toeic-blue/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-toeic-blue">~20</div>
                    <p className="text-sm text-muted-foreground">Phút</p>
                  </CardContent>
                </Card>
                <Card className="bg-toeic-warning/5 border-toeic-warning/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-toeic-warning">3</div>
                    <p className="text-sm text-muted-foreground">Cấp độ</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-toeic-blue/5 to-toeic-success/5 rounded-lg p-4 text-left border border-toeic-blue/20">
                <h4 className="font-semibold mb-2 text-toeic-navy">Thông tin bài kiểm tra:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-toeic-success" />
                    Bao gồm các câu hỏi về từ vựng, ngữ pháp, đọc hiểu
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-toeic-success" />
                    Đánh giá theo 3 cấp độ: A1, A2, B1
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-toeic-success" />
                    Gợi ý khóa học phù hợp sau khi hoàn thành
                  </li>
                </ul>
              </div>

              <Button size="lg" onClick={() => setHasStarted(true)} className="px-8 bg-toeic-blue hover:bg-toeic-blue/90 text-white">
                Bắt đầu làm bài
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Results Screen
  if (showResults) {
    return (
      <section className="py-12 min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Results Header */}
          <Card className="text-center mb-8 bg-card/70 border-border/50 shadow-lg">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-toeic-success/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-toeic-success" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-toeic-navy">
                Hoàn thành bài kiểm tra!
              </CardTitle>
              <p className="text-muted-foreground">
                Dựa trên kết quả, chúng tôi đề xuất khóa học phù hợp cho bạn
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                <Card className="bg-toeic-success/5 border-toeic-success/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-toeic-success">{results.correctCount}</div>
                    <p className="text-sm text-muted-foreground">Câu đúng</p>
                  </CardContent>
                </Card>
                <Card className="bg-toeic-danger/5 border-toeic-danger/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-toeic-danger">{40 - results.correctCount - results.skippedCount}</div>
                    <p className="text-sm text-muted-foreground">Câu sai</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-100 dark:bg-gray-800 border-border/50">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-muted-foreground">{results.skippedCount}</div>
                    <p className="text-sm text-muted-foreground">Bỏ qua</p>
                  </CardContent>
                </Card>
                <Card className="bg-toeic-blue/5 border-toeic-blue/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-toeic-blue">{results.scorePercent}%</div>
                    <p className="text-sm text-muted-foreground">Điểm số</p>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1 bg-toeic-warning/5 border-toeic-warning/20">
                  <CardContent className="pt-6 text-center">
                    <Badge className={`text-lg px-4 py-1 ${results.recommendedLevel === "A1" ? "bg-toeic-success text-white" :
                      results.recommendedLevel === "A2" ? "bg-toeic-blue text-white" : "bg-toeic-warning text-white"
                      }`}>
                      {results.recommendedLevel}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">Trình độ</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6">
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Làm lại bài kiểm tra
                </Button>
              </div>

              {/* Breakdown */}
              <div className="grid sm:grid-cols-3 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">A1 - Cơ bản</span>
                    <span className="text-sm text-muted-foreground">
                      {results.breakdown.a1.correct}/{results.breakdown.a1.total}
                    </span>
                  </div>
                  <Progress
                    value={(results.breakdown.a1.correct / results.breakdown.a1.total) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">A2 - Sơ trung cấp</span>
                    <span className="text-sm text-muted-foreground">
                      {results.breakdown.a2.correct}/{results.breakdown.a2.total}
                    </span>
                  </div>
                  <Progress
                    value={(results.breakdown.a2.correct / results.breakdown.a2.total) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">B1 - Trung cấp</span>
                    <span className="text-sm text-muted-foreground">
                      {results.breakdown.b1.correct}/{results.breakdown.b1.total}
                    </span>
                  </div>
                  <Progress
                    value={(results.breakdown.b1.correct / results.breakdown.b1.total) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Recommendations */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-toeic-navy">Khóa học được đề xuất</h2>
            <div className="space-y-4">
              {courseRecommendations.map((course) => (
                <LevelCard
                  key={course.level}
                  course={course}
                  isRecommended={course.level === results.recommendedLevel}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Quiz Screen
  return (
    <section className="py-12 min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-toeic-navy">
            Bài kiểm tra đánh giá trình độ
          </h2>
          <p className="text-muted-foreground">
            Trả lời các câu hỏi để xác định trình độ của bạn
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6 bg-card/70 border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-toeic-navy">Tiến trình</span>
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{quizQuestions.length} câu đã trả lời
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Câu {currentQuestion + 1}/{quizQuestions.length}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~{Math.ceil((40 - answeredCount) * 0.5)} phút còn lại</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card className="mb-6 bg-card/70 border-border/50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-3 text-toeic-navy">Chuyển nhanh đến câu hỏi:</p>
            <div className="flex flex-wrap gap-1">
              {quizQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 text-xs rounded-md transition-all ${currentQuestion === idx
                    ? 'bg-toeic-blue text-white'
                    : selectedAnswers[idx] !== null
                      ? 'bg-toeic-success/20 text-toeic-success border border-toeic-success/30'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge className={`${getDifficultyColor(question.difficulty)} text-primary-foreground`}>
                  {question.difficulty.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTypeIcon(question.type)}
                  {getTypeLabel(question.type)}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                Câu {currentQuestion + 1}
              </span>
            </div>
            <CardTitle className="text-lg md:text-xl mt-4">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-200 hover:border-primary ${selectedAnswers[currentQuestion] === index
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAnswers[currentQuestion] === index
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                      }`}>
                      {selectedAnswers[currentQuestion] === index && (
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-muted-foreground">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  variant="outline"
                  className="border-success text-success hover:bg-success hover:text-primary-foreground"
                >
                  Nộp bài ({answeredCount}/40)
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
                {currentQuestion < quizQuestions.length - 1 && (
                  <Button onClick={handleNext}>
                    Tiếp tục
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {answeredCount < quizQuestions.length && (
              <div className="mt-4 p-3 bg-warning/10 rounded-lg text-center">
                <p className="text-sm text-warning font-medium">
                  Bạn có thể nộp bài bất cứ lúc nào. Câu chưa trả lời sẽ tính là sai.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AssessmentQuiz;
