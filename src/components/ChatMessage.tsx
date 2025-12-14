import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  text: string;
  textVi?: string;
  speaker: string;
  isRight?: boolean;
  isActive?: boolean;
  isCompleted?: boolean;
}

export const ChatMessage = ({ text, textVi, speaker, isRight = false, isActive = false, isCompleted = false }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex items-start gap-3 mb-6",
      isRight ? "flex-row-reverse animate-slide-in-right" : "flex-row animate-slide-in-left"
    )}>
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110",
          isRight ? "bg-muted" : "bg-info/20"
        )}>
          <User className={cn(
            "h-6 w-6",
            isRight ? "text-muted-foreground" : "text-info"
          )} />
        </div>
        <span className="text-xs text-muted-foreground">{speaker}</span>
      </div>
      <div className={cn(
        "rounded-2xl px-6 py-3 max-w-md transition-all duration-300 shadow-sm hover:shadow-md",
        isRight
          ? "bg-muted text-foreground"
          : "bg-info text-info-foreground",
        isActive && "ring-2 ring-emerald-500 bg-emerald-50/50 animate-pulse",
        isCompleted && !isActive && "ring-2 ring-green-500 bg-green-50 opacity-90"
      )}>
        <p className="text-base mb-1">{text}</p>
        {textVi && (
          <p className={cn(
            "text-sm mt-2 pt-2 border-t opacity-80",
            isRight ? "border-muted-foreground/20" : "border-info-foreground/20"
          )}>
            {textVi}
          </p>
        )}
      </div>
    </div>
  );
};
