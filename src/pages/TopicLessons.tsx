import { useParams, Link } from "react-router-dom";
import { useLessons } from "@/hooks/useLessons";
import { useTopics } from "@/hooks/useTopics";
import { TopicCard } from "@/components/TopicCard";
import { formatDuration } from "@/services/luyennghevideo";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Headphones } from "lucide-react";

const TopicLessons = () => {
  const { topicId } = useParams();
  const { data: topics } = useTopics();
  const { data: lessons, isLoading } = useLessons(topicId ? parseInt(topicId) : null);

  const currentTopic = topics?.find((t) => t.id === parseInt(topicId || "0"));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-level-b2 flex items-center justify-center">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">UTC EngLish</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Topics
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{currentTopic?.name}</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{currentTopic?.name}</h1>
        <p className="text-muted-foreground mb-8">{currentTopic?.description}</p>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video" />
            ))}
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lessons.map((lesson) => (
              <Link key={lesson.id} to={`/topic/${topicId}/lesson/${lesson.id}`}>
                <TopicCard
                  title={lesson.title}
                  thumbnail={lesson.thumbnailUrl}
                  duration={formatDuration(lesson.durationSeconds)}
                  level={lesson.level}
                  views={lesson.viewCount}
                  hasDictation={lesson.isDictationEnabled}
                  hasShadowing={lesson.isShadowingEnabled}
                  isPremium={false}
                  source="Youtube"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có bài học trong chủ đề này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicLessons;
