export interface ToeicTestListItem {
  id: number;
  title: string;
  year: number;
  duration_minutes: number;
  num_questions: number;
  target_level: string;
}

export interface ToeicQuestion {
  questionNo: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export interface ToeicPassage {
  title: string;
  passageText: string;
  questions: any[];
}

export interface ToeicPart {
  partNo: number;
  description: string;
  passages: ToeicPassage[];
  questions: ToeicQuestion[];
}

export interface ToeicTestDetail {
  id: number;
  title: string;
  year: number;
  duration_minutes: number;
  parts: ToeicPart[];
}

export interface ToeicUserAnswer {
  questionNo: number;
  selectedOption: string;
}
