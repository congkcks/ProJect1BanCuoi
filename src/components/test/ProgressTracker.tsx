import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressTrackerProps {
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestion: number;
}

export const ProgressTracker = ({ 
  totalQuestions, 
  answeredQuestions, 
  currentQuestion 
}: ProgressTrackerProps) => {
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">
            {answeredQuestions} / {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>{answeredQuestions} answered</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-4 w-4" />
            <span>{totalQuestions - answeredQuestions} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
