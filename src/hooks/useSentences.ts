import { useQuery } from "@tanstack/react-query";
import { fetchSentencesByLesson } from "@/services/api";

export const useSentences = (lessonId: number | null) => {
  return useQuery({
    queryKey: ["sentences", lessonId],
    queryFn: () => fetchSentencesByLesson(lessonId!),
    enabled: lessonId !== null,
    staleTime: 1000 * 60 * 5,
  });
};
