import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question, UserAnswer } from "@/types/test";
import { Image as ImageIcon } from "lucide-react";

interface QuestionDisplayProps {
  question: Question;
  userAnswer?: string;
  onAnswer: (questionId: number, answer: string) => void;
}

export const QuestionDisplay = ({ question, userAnswer, onAnswer }: QuestionDisplayProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(userAnswer || "");
  useEffect(() => {
    setSelectedAnswer(userAnswer || "");
  }, [userAnswer, question.questionId]);

  const handleAnswerChange = (value: string) => {
    setSelectedAnswer(value);
    onAnswer(question.questionId, value);
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

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    // If it's already a direct URL, return it
    if (url.startsWith('http') && !url.includes('drive.google.com')) {
      return url;
    }
    // Handle Google Drive links
    const fileIdMatch = url.match(/\/d\/(.+?)\//);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">
          Question {question.questionNumber} (Part {question.part})
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
              onError={(e) => {
                console.error("Image load error:", e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {question.questionText && (
          <div className="text-base font-medium">
            {question.questionText}
          </div>
        )}

        <RadioGroup value={selectedAnswer} onValueChange={handleAnswerChange}>
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.label}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === option.label
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={option.label} id={`q${question.questionId}-${option.label}`} />
                <Label
                  htmlFor={`q${question.questionId}-${option.label}`}
                  className="flex-1 cursor-pointer text-base"
                >
                  <span className="font-semibold">{option.label}.</span>{' '}
                  {option.text || `Option ${option.label}`}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
