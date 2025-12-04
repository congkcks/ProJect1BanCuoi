import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSentences } from "@/hooks/useSentences";
import { useLessons } from "@/hooks/useLessons";
import { useTopics } from "@/hooks/useTopics";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { DictationPanel } from "@/components/DictationPanel";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { getYoutubeVideoId, formatDuration } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Clock, Play, RotateCcw, Eye, EyeOff, Headphones } from "lucide-react";
import { Sentence } from "@/types/api";

const LessonDetail = () => {
  const { topicId, lessonId } = useParams();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [completedIndexes, setCompletedIndexes] = useState<number[]>([]);
  const [playStartTime, setPlayStartTime] = useState<number | undefined>();
  const playerRef = useRef<any>(null);

  const { data: topics } = useTopics();
  const { data: lessons } = useLessons(topicId ? parseInt(topicId) : null);
  const { data: sentences, isLoading: sentencesLoading } = useSentences(
    lessonId ? parseInt(lessonId) : null
  );

  const currentTopic = topics?.find((t) => t.id === parseInt(topicId || "0"));
  const currentLesson = lessons?.find((l) => l.id === parseInt(lessonId || "0"));
  const videoId = currentLesson?.videoUrl
    ? getYoutubeVideoId(currentLesson.videoUrl)
    : null;

  const handlePlaySentence = (sentence: Sentence) => {
    setPlayStartTime(sentence.startTime);
  };

  const handleTimeUpdate = (time: number) => {
    if (!sentences) return;
    const current = sentences.findIndex(
      (s) => time >= s.startTime && time < s.endTime
    );
    if (current !== -1 && current !== currentSentenceIndex) {
      setCurrentSentenceIndex(current);
    }
  };

  const handleSentenceComplete = (index: number) => {
    if (!completedIndexes.includes(index)) {
      setCompletedIndexes([...completedIndexes, index]);
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-[500px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Topics
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              to={`/topic/${topicId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {currentTopic?.name}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate max-w-xs">
              {currentLesson.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video and Dictation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-card-foreground">Video</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(currentLesson.durationSeconds)}
                </div>
              </div>

              {videoId && (
                <YouTubePlayer
                  videoId={videoId}
                  onTimeUpdate={handleTimeUpdate}
                  startTime={playStartTime}
                />
              )}

              {/* Video Controls */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Điều khiển</p>
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Phát lại
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-card-foreground mt-4">
                {currentLesson.title}
              </h3>
            </div>

            {/* Dictation Panel */}
            {sentences && sentences.length > 0 && (
              <DictationPanel
                sentences={sentences}
                currentIndex={currentSentenceIndex}
                onIndexChange={setCurrentSentenceIndex}
                onPlaySentence={handlePlaySentence}
                level={currentLesson.level}
              />
            )}
          </div>

          {/* Right Column - Transcript */}
          <div>
            {sentencesLoading ? (
              <Skeleton className="h-[500px]" />
            ) : sentences && sentences.length > 0 ? (
              <TranscriptPanel
                sentences={sentences}
                currentIndex={currentSentenceIndex}
                onSentenceClick={(index) => {
                  setCurrentSentenceIndex(index);
                  if (sentences[index]) {
                    handlePlaySentence(sentences[index]);
                  }
                }}
                completedIndexes={completedIndexes}
              />
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <p className="text-muted-foreground">Chưa có transcript</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
