export interface TestListItem {
  testId: string;
  title: string;
}

export interface TestOption {
  label: string;
  text: string | null;
}

export interface Question {
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
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  selectedAnswer: string;
}

export interface TestSession {
  sessionId: string;
  message: string;
}

export interface TestResult {
  message: string;
  totalScore: number;
}

export interface TestHistoryItem {
  sessionId: string;
  testId: string;
  totalScore: number;
  startedAt: string;
  finishedAt: string;
}
