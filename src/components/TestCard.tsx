import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import { TestListItem } from "@/types/test";

interface TestCardProps {
  test: TestListItem;
}

export const TestCard = ({ test }: TestCardProps) => {
  return (
    <Card className="group hover:shadow-card-lg transition-all duration-300 border-2 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl group-hover:text-primary transition-colors">
              {test.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              TOEIC Practice Test
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Timed test with full explanations</span>
        </div>
        <Link to={`/test/${test.testId}`}>
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
            Start Test
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
