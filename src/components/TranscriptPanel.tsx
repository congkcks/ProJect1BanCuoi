import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle } from "lucide-react";
import { Sentence } from "@/types/api";

interface TranscriptPanelProps {
  sentences: Sentence[];
  currentIndex: number;
  onSentenceClick: (index: number) => void;
  completedIndexes: number[];
}

export const TranscriptPanel = ({
  sentences,
  currentIndex,
  onSentenceClick,
  completedIndexes,
}: TranscriptPanelProps) => {
  const progress = sentences.length > 0 
    ? Math.round((completedIndexes.length / sentences.length) * 100) 
    : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground">Bản chép</h3>
        <span className="text-sm text-primary font-medium">{progress}%</span>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {sentences.map((sentence, index) => {
            const isActive = index === currentIndex;
            const isCompleted = completedIndexes.includes(index);
            
            return (
              <div
                key={sentence.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/50 border-transparent hover:bg-muted"
                }`}
                onClick={() => onSentenceClick(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <FileText className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <AlertTriangle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-card-foreground mt-2">
                  {isCompleted
                    ? sentence.english
                    : sentence.english
                        .split(" ")
                        .map((w) => "*".repeat(w.length))
                        .join(" ")}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
