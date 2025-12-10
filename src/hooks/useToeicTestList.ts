import { useQuery } from "@tanstack/react-query";
import { ToeicTestListItem } from "@/types/toeic";

export const useToeicTestList = () => {
  return useQuery({
    queryKey: ["toeic-test-list"],
    queryFn: async () => {
      const response = await fetch("https://luyendocapi.onrender.com/api/toeic/tests");
      if (!response.ok) {
        throw new Error("Failed to fetch TOEIC test list");
      }
      return response.json() as Promise<ToeicTestListItem[]>;
    },
  });
};
