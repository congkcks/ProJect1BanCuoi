import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFlashcardsByGroup } from "@/lib/luyentuvung";
import { FlashcardItem } from "@/components/FlashcardItem";
import { QuizMode } from "@/components/QuizMode";
import { MemoryGame } from "@/components/MemoryGame";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Brain, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"study" | "quiz" | "memory">("study");

  const { data, isLoading } = useQuery({
    queryKey: ["flashcards", groupId],
    queryFn: () => fetchFlashcardsByGroup(groupId!),
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary via-primary to-accent py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <Skeleton className="h-8 w-64 bg-white/20" />
          </div>
        </div>
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[280px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{data.groupName}</h1>
            <p className="text-white/90">
              {data.total} {data.total === 1 ? "word" : "words"} to learn
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "study" | "quiz" | "memory")} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-12">
            <TabsTrigger value="study" className="text-base">
              <BookOpen className="h-4 w-4 mr-2" />
              Study Mode
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-base">
              <Brain className="h-4 w-4 mr-2" />
              Quiz Mode
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-base">
              <Zap className="h-4 w-4 mr-2" />
              Memory Game
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((flashcard) => (
                <FlashcardItem key={flashcard.id} flashcard={flashcard} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <QuizMode
              flashcards={data.data}
              onComplete={() => setMode("study")}
            />
          </TabsContent>

          <TabsContent value="memory">
            <MemoryGame flashcards={data.data} groupId={groupId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupDetail;
