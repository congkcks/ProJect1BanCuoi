import { useQuery } from "@tanstack/react-query";

export interface TestOption {
  label: string;
  text: string | null;
}

export interface TestQuestion {
  questionId: number;
  questionNumber: number;
  part: number;
  questionText: string | null;
  correctAnswer: string;
  explanation: string;
  audioUrl: string | null;
  imageUrl: string | null;
  passageText: string | null;
  options: TestOption[];
}

export interface TestDetail {
  testId: string;
  title: string;
  duration: number;
  totalQuestions: number;
  questions: TestQuestion[];
}

export const useTestDetail = (testId: string | null) => {
  return useQuery({
    queryKey: ["test-detail", testId],
    queryFn: async () => {
      if (!testId) throw new Error("Test ID is required");
      const response = await fetch(`https://luyende.onrender.com/api/Home/start/${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test detail");
      }
      return response.json() as Promise<TestDetail>;
    },
    enabled: !!testId,
  });
};
