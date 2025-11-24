import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <BookOpen className="mx-auto mb-6 h-20 w-20 text-primary" />
        <h1 className="mb-4 text-5xl font-bold text-foreground">English Conversation Practice</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Improve your speaking skills with interactive conversation topics
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/topics')}
          className="text-lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
