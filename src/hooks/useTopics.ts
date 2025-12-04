import { useQuery } from "@tanstack/react-query";
import { fetchTopics } from "@/services/api";

export const useTopics = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    staleTime: 1000 * 60 * 5,
  });
};
