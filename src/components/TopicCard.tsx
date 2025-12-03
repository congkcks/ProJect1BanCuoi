import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Headphones, MessageSquare, Eye } from "lucide-react";

export type DifficultyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface TopicCardProps {
  title: string;
  thumbnail: string;
  duration: string;
  level: DifficultyLevel;
  views: number;
  hasDictation?: boolean;
  hasShadowing?: boolean;
  isPremium?: boolean;
  source?: string;
}

const levelColors: Record<DifficultyLevel, string> = {
  A1: "bg-level-a1",
  A2: "bg-level-a2",
  B1: "bg-level-b1",
  B2: "bg-level-b2",
  C1: "bg-level-c1",
  C2: "bg-level-c2",
};

export const TopicCard = ({
  title,
  thumbnail,
  duration,
  level,
  views,
  hasDictation = false,
  hasShadowing = false,
  isPremium = false,
  source = "Youtube",
}: TopicCardProps) => {
  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-medium text-white bg-black/70 px-2 py-1 rounded">
          <Clock className="h-3 w-3" />
          {duration}
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-medium text-white bg-black/70 px-2 py-1 rounded">
          <Eye className="h-3 w-3" />
          {views.toLocaleString()}
        </div>
        <Badge className={`absolute top-2 right-2 ${levelColors[level]} text-white border-0`}>
          {level}
        </Badge>
        {isPremium && (
          <Badge className="absolute top-2 left-2 bg-premium text-premium-foreground border-0">
            PRO
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasDictation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Dictation</span>
              </div>
            )}
            {hasShadowing && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Headphones className="h-3.5 w-3.5" />
                <span>Shadowing</span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{source}</span>
        </div>
      </div>
    </Card>
  );
};
