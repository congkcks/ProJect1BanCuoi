export interface FlashcardGroup {
  id: string;
  name: string;
  type: "CEFR" | "COMMON" | "IELTS" | "TOEIC" | "TOPIC";
  createdAt: string;
  flashcardCount: number;
}

export interface Flashcard {
  id: string;
  englishWord: string;
  phonetic: string;
  vietnameseMeaning: string;
  exampleSentenceEn: string;
  exampleSentenceVi: string;
}

export interface FlashcardGroupDetail {
  groupId: string;
  groupName: string;
  total: number;
  data: Flashcard[];
}
