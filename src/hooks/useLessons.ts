import { useQuery } from "@tanstack/react-query";
import { fetchLessonsByTopic } from "@/services/api";

export const useLessons = (topicId: number | null) => {
  return useQuery({
    queryKey: ["lessons", topicId],
    queryFn: () => fetchLessonsByTopic(topicId!),
    enabled: topicId !== null,
    staleTime: 1000 * 60 * 5,
  });
};
