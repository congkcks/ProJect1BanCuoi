export interface ReadingLevel {
  value: string;
  label: string;
}

export interface VocabItem {
  word: string;
  pos: string;
  meaning_vi: string;
  example_en: string;
}

export interface Quiz {
  type: 'mcq' | 'tf' | 'gapfill';
  question: string;
  options?: string[];
  correct?: string;
  answer?: boolean | string;
  explanation?: string;
}

export interface ReadingMeta {
  level: string;
  topic: string;
  title: string;
  words: number;
  schema_version: number;
}

export interface PreReading {
  warmup_questions: string[];
  key_vocab: VocabItem[];
}

export interface ReadingText {
  paragraphs: string[];
}

export interface PostReading {
  quizzes: Quiz[];
  summary_task: string;
  vocab_review: string[];
}

export interface ReadingLesson {
  meta: ReadingMeta;
  pre_reading: PreReading;
  text: ReadingText;
  post_reading: PostReading;
}

export interface ReadingConfig {
  Level: string;
  Topic: string;
  TargetWords: number;
  Locale: string;
}
