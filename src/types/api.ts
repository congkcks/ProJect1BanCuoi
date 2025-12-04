export interface Topic {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  createdAt: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  topicId: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  viewCount: number;
  isShadowingEnabled: boolean;
  isDictationEnabled: boolean;
  createdAt: string;
  lessonSentences: Sentence[];
  topic: Topic | null;
}

export interface Sentence {
  id: number;
  lessonId: number;
  sequence: number;
  startTime: number;
  endTime: number;
  english: string;
  vietnamese: string;
  lesson: Lesson | null;
}
