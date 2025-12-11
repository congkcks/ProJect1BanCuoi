import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { testApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Home, CheckCircle2, XCircle } from "lucide-react";
import { Question } from "@/types/test";

const Review = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: reviewData, isLoading } = useQuery({
    queryKey: ["review", sessionId],
    queryFn: () => testApi.getReview(sessionId!),
    enabled: !!sessionId,
  });

  const { data: testDetail } = useQuery({
    queryKey: ["test", reviewData?.testId],
    queryFn: () => testApi.getTestDetail(reviewData.testId),
    enabled: !!reviewData?.testId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!reviewData || !testDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Review not found</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userAnswersMap = new Map(
    reviewData.answers?.map((ans: any) => [ans.questionId, ans.selectedOption]) || []
  );

  const correctCount = testDetail.questions.filter(
    (q: Question) => userAnswersMap.get(q.questionId) === q.correctAnswer
  ).length;

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
            <h1 className="text-xl font-bold">Test Review</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{reviewData.totalScore}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{correctCount}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">
                  {testDetail.totalQuestions - correctCount}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {Math.round((correctCount / testDetail.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-6">
          {testDetail.questions.map((question: Question, idx: number) => {
            const userAnswer = userAnswersMap.get(question.questionId);
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card
                key={question.questionId}
                className={`${
                  isCorrect ? 'border-success' : userAnswer ? 'border-destructive' : 'border-warning'
                } border-2`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">
                      Question {question.questionNumber} (Part {question.part})
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {question.audioUrl && getAudioEmbedUrl(question.audioUrl) && (
                    <div className="w-full">
                      <iframe
                        src={getAudioEmbedUrl(question.audioUrl)!}
                        className="w-full h-[52px] border border-border rounded-lg"
                        allow="autoplay"
                      />
                    </div>
                  )}

                  {question.passageText && (
                    <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                      <p className="text-sm whitespace-pre-wrap">{question.passageText}</p>
                    </div>
                  )}

                  {question.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={getImageUrl(question.imageUrl)}
                        alt={`Question ${question.questionNumber}`}
                        className="max-w-full h-auto rounded-lg border-2 border-border shadow-card"
                      />
                    </div>
                  )}

                  {question.questionText && (
                    <div className="text-base font-medium">{question.questionText}</div>
                  )}

                  <div className="space-y-3">
                    {question.options.map((option) => {
                      const isUserAnswer = userAnswer === option.label;
                      const isCorrectAnswer = question.correctAnswer === option.label;

                      return (
                        <div
                          key={option.label}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? 'border-success bg-success/10'
                              : isUserAnswer
                              ? 'border-destructive bg-destructive/10'
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-semibold">{option.label}.</span>{' '}
                              {option.text || `Option ${option.label}`}
                            </div>
                            {isCorrectAnswer && (
                              <span className="text-success text-sm font-medium">Correct Answer</span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="text-destructive text-sm font-medium">Your Answer</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Explanation:</h4>
                      <p className="text-sm whitespace-pre-wrap">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Review;
