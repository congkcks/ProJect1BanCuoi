import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { testApi } from "@/lib/api";
import { TestCard } from "@/components/TestCard";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, History as HistoryIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: tests, isLoading, error } = useQuery({
    queryKey: ["tests"],
    queryFn: testApi.getTestList,
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load tests. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  UTC-EngLish
                </h1>
                <p className="text-sm text-muted-foreground">TOEIC Practice Platform</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/history")}
              className="gap-2"
            >
              <HistoryIcon className="h-4 w-4" />
              Test History
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#00D4FF]">
            Chinh Phục TOEIC
          </h2>
          <p className="text-xl text-muted-foreground">
            Luyện tập với đề thi thực tế, theo dõi tiến trình và đạt điểm mục tiêu của bạn
          </p>
        </div>

        {/* Tests Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading available tests...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {tests?.map((test) => (
              <TestCard key={test.testId} test={test} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 UTC-EngLish. Practice makes perfect.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
