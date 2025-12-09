import { useParams } from "react-router-dom";
import ReadingLesson from "@/components/lessons/ReadingLesson";

// Unified reading route: readingId may be a lesson code (BH...) or a doc code (BD...)
const ReadingLessonPage = () => {
  const { readingId } = useParams<{ readingId?: string }>();
  return <ReadingLesson lessonId={readingId} />;
};

export default ReadingLessonPage;
