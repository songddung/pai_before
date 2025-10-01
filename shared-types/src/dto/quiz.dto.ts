export interface CreateQuizDto {
  question: string;
  answer: string;
  reward?: string;
}

export interface UpdateQuizDto {
  question?: string;
  answer?: string;
  reward?: string;
}

export interface SubmitQuizDto {
  answer: string;
}