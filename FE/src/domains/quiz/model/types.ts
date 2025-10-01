export type Answer = {
  id: string;
  text: string;
  similarity: number; // 0~100
  correct: boolean;
};

export interface Quiz {
  id: string;
  title: string;
  question: string;
}