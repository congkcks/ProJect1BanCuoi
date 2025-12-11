import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";

interface TestTimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
}

export const TestTimer = ({ duration, onTimeUp }: TestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        if (prev <= 300) { // 5 minutes warning
          setIsWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className={`${isWarning ? 'border-warning' : 'border-primary'} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {isWarning ? (
            <AlertCircle className="h-5 w-5 text-warning animate-pulse" />
          ) : (
            <Clock className="h-5 w-5 text-primary" />
          )}
          <div>
            <div className="text-xs text-muted-foreground">Time Remaining</div>
            <div className={`text-2xl font-bold tabular-nums ${isWarning ? 'text-warning' : 'text-foreground'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
