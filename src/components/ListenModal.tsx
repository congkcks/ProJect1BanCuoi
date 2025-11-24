import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ListenModalProps {
  open: boolean;
  onClose: () => void;
  sentence: string;
  sentenceVi?: string;
  speaker: string;
  isRight?: boolean;
}

export const ListenModal = ({ 
  open, 
  onClose, 
  sentence,
  sentenceVi,
  speaker,
  isRight = false
}: ListenModalProps) => {

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-card border-0 animate-scale-in">
        <VisuallyHidden>
          <DialogTitle>Listening Practice</DialogTitle>
          <DialogDescription>Listen to the conversation</DialogDescription>
        </VisuallyHidden>
        <div className="flex items-start gap-3 py-6 animate-fade-in">
          <div className={cn(
            "flex flex-col items-center gap-1 order-1",
            isRight && "order-2"
          )}>
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md",
              isRight ? "bg-muted" : "bg-info/20"
            )}>
              <User className={cn(
                "h-8 w-8",
                isRight ? "text-muted-foreground" : "text-info"
              )} />
            </div>
            <span className="text-sm font-medium text-foreground">{speaker}</span>
          </div>
          <div className={cn(
            "rounded-2xl px-6 py-4 flex-1 order-2 shadow-lg transition-all hover:shadow-xl",
            isRight 
              ? "bg-muted text-foreground order-1" 
              : "bg-info text-info-foreground"
          )}>
            <p className="text-lg mb-2">{sentence}</p>
            {sentenceVi && (
              <p className={cn(
                "text-sm mt-3 pt-3 border-t opacity-80",
                isRight ? "border-muted-foreground/20" : "border-info-foreground/20"
              )}>
                {sentenceVi}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
