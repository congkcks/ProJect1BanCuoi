import { Mic, PenLine } from "lucide-react";

export type PracticeMode = "shadowing" | "dictation";

interface PracticeModeSelectorProps {
  onSelect: (mode: PracticeMode) => void;
}

export const PracticeModeSelector = ({ onSelect }: PracticeModeSelectorProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground text-center mb-2">
        Chọn chế độ luyện tập
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Chọn một chế độ để bắt đầu luyện tập
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Shadowing Option */}
        <button
          onClick={() => onSelect("shadowing")}
          className="group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border bg-muted/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-card-foreground mb-1">Shadowing</h4>
            <p className="text-xs text-muted-foreground">
              Nghe và nói theo, đánh giá phát âm
            </p>
          </div>
        </button>

        {/* Dictation Option */}
        <button
          onClick={() => onSelect("dictation")}
          className="group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border bg-muted/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            <PenLine className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-card-foreground mb-1">Chép chính tả</h4>
            <p className="text-xs text-muted-foreground">
              Nghe và gõ lại câu bạn nghe được
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
