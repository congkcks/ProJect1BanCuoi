import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, X } from "lucide-react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Word {
  text: string;
  status: 'correct' | 'incorrect' | 'missing' | 'pending';
}

interface SpeakingModalProps {
  open: boolean;
  onClose: () => void;
  sentence: string;
  sentenceVi?: string;
  speaker: string;
  isRecording: boolean;
  words: Word[];
  onPlaySentence: () => void;
  onStartRecording: () => void;
}

export const SpeakingModal = ({
  open,
  onClose,
  sentence,
  sentenceVi,
  speaker,
  isRecording,
  words,
  onPlaySentence,
  onStartRecording
}: SpeakingModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-card animate-scale-in">
        <DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Current Sentence */}
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center transition-all hover:scale-110">
                <User className="h-6 w-6 text-info" />
              </div>
              <span className="text-xs text-muted-foreground">{speaker}</span>
            </div>
            <div className="bg-info text-info-foreground rounded-2xl px-6 py-3 flex-1 flex items-center justify-between shadow-md">
              <div className="flex-1">
                <p className="text-base mb-1">{sentence}</p>
                {sentenceVi && (
                  <p className="text-sm mt-2 pt-2 border-t border-info-foreground/20 opacity-80">
                    {sentenceVi}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-info-foreground hover:bg-info-foreground/20 ml-2 shrink-0 transition-all hover:scale-110"
                onClick={onPlaySentence}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Word-by-word scoring */}
          <div className="bg-accent/50 rounded-lg p-4 border border-border">
            <div className="flex flex-wrap gap-2 text-base">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-3 py-1.5 rounded-full font-medium transition-all duration-300",
                    word.status === 'correct' && "bg-sky-100 text-sky-700 border border-sky-300 shadow-sm",
                    word.status === 'incorrect' && "bg-red-100 text-red-700 line-through border border-red-300 shadow-sm",
                    word.status === 'missing' && "bg-amber-100 text-amber-700 border border-amber-300 shadow-sm",
                    word.status === 'pending' && "bg-gray-100 text-gray-700 border border-gray-300"
                  )}
                >
                  {word.text}
                </span>
              ))}
            </div>
          </div>

          {/* Recording Status */}
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              onClick={onStartRecording}
              disabled={isRecording}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                isRecording
                  ? "bg-destructive animate-pulse cursor-not-allowed scale-110"
                  : "bg-destructive hover:bg-destructive/90 cursor-pointer hover:scale-110 shadow-lg hover:shadow-xl"
              )}
            >
              <Mic className="h-8 w-8 text-destructive-foreground" />
            </button>
            <p className="text-center text-sm text-muted-foreground">
              {isRecording
                ? "Voice recognition is active..."
                : "Click to start recording"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
