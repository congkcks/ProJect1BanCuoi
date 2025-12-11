import { Link } from "react-router-dom";
import { FlashcardGroup } from "@/types/flashcard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface GroupCardProps {
  group: FlashcardGroup;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "CEFR":
      return "bg-primary/10 text-primary border-primary/20";
    case "COMMON":
      return "bg-success/10 text-success border-success/20";
    case "IELTS":
      return "bg-accent/10 text-accent border-accent/20";
    case "TOEIC":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "TOPIC":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "CEFR":
      return "CEFR Level";
    case "COMMON":
      return "Common Words";
    case "IELTS":
      return "IELTS";
    case "TOEIC":
      return "TOEIC";
    case "TOPIC":
      return "Topic";
    default:
      return type;
  }
};

export const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <Link to={`/group/${group.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{group.name}</CardTitle>
            <Badge variant="outline" className={getTypeColor(group.type)}>
              {getTypeLabel(group.type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">
              {group.flashcardCount} {group.flashcardCount === 1 ? "word" : "words"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
