import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { getTopics } from "@/services/conversationApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const Topics = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
  });

  const categories = useMemo(() => {
    if (!topics) return [];
    const cats = Array.from(new Set(topics.map(t => {
      // Extract category from description or title
      const lower = t.title.toLowerCase();
      if (lower.includes('work') || lower.includes('job')) return 'Work';
      if (lower.includes('food') || lower.includes('restaurant') || lower.includes('coffee')) return 'Food & Dining';
      if (lower.includes('travel') || lower.includes('airport')) return 'Travel';
      if (lower.includes('shop') || lower.includes('buy')) return 'Shopping';
      if (lower.includes('health') || lower.includes('doctor')) return 'Health';
      return 'General';
    })));
    return cats.sort();
  }, [topics]);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    return topics.filter(topic => {
      const levelMatch = !selectedLevel || topic.level === selectedLevel;
      const categoryMatch = !selectedCategory || (() => {
        const lower = topic.title.toLowerCase();
        if (selectedCategory === 'Work') return lower.includes('work') || lower.includes('job');
        if (selectedCategory === 'Food & Dining') return lower.includes('food') || lower.includes('restaurant') || lower.includes('coffee');
        if (selectedCategory === 'Travel') return lower.includes('travel') || lower.includes('airport');
        if (selectedCategory === 'Shopping') return lower.includes('shop') || lower.includes('buy');
        if (selectedCategory === 'Health') return lower.includes('health') || lower.includes('doctor');
        if (selectedCategory === 'General') return true;
        return false;
      })();
      return levelMatch && categoryMatch;
    });
  }, [topics, selectedLevel, selectedCategory]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1':
        return 'bg-toeic-success text-white';
      case 'A2':
        return 'bg-toeic-blue text-white';
      case 'B1':
        return 'bg-toeic-warning text-white';
      case 'B2':
        return 'bg-toeic-danger text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-8 h-12 w-64" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load topics. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-toeic-navy">Conversation Topics</h1>
          <p className="text-lg text-muted-foreground">
            Choose a topic to practice your English conversation skills
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-toeic-navy">Level</h3>
            <div className="flex flex-wrap gap-2">
              {['A1', 'A2', 'B1', 'B2'].map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "hero" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                  className={cn(
                    selectedLevel === level && "bg-toeic-blue text-white"
                  )}
                >
                  {level}
                </Button>
              ))}
              {selectedLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLevel(null)}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-toeic-navy">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "hero" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={cn(
                    selectedCategory === category && "bg-toeic-success text-white"
                  )}
                >
                  {category}
                </Button>
              ))}
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.topic_id}
              className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-border/50 bg-card/70 hover:bg-card"
              onClick={() => navigate(`/topicspeaker/${topic.topic_id}`)}
            >
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge className={getLevelColor(topic.level)}>
                    {topic.level}
                  </Badge>
                  <BookOpen className="h-5 w-5 text-toeic-blue" />
                </div>
                <CardTitle className="text-xl text-toeic-navy">{topic.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-muted-foreground">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(topic.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
