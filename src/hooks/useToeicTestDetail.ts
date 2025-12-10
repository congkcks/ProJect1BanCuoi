import { useQuery } from "@tanstack/react-query";
import { ToeicTestDetail } from "@/types/toeic";

export const useToeicTestDetail = (testId: number | null) => {
  return useQuery({
    queryKey: ["toeic-test-detail", testId],
    queryFn: async () => {
      if (!testId) throw new Error("Test ID is required");
      const response = await fetch(`https://luyendocapi.onrender.com/api/toeic/test/${testId}/full`);
      if (!response.ok) {
        throw new Error("Failed to fetch TOEIC test detail");
      }
      return response.json() as Promise<ToeicTestDetail>;
    },
    enabled: !!testId,
  });
};
