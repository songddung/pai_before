export interface QuizResponse {
  id: string;
  parentId: string;
  question: string;
  answer: string;
  reward?: string;
  quizDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface QuizResultInfo {
  isSolved: boolean;
  totalAttempts: number;
  rewardGiven: boolean;
}

export interface AvailableQuizResponse {
  id: string;
  parentId: string;
  question: string;
  reward?: string;
  quizDate: string;
  isActive: boolean;  // false면 이미 풀었음 (못 풀게 막음)
  myResult: QuizResultInfo | null;
}

export interface QuizSubmitResponse {
  isSolved: boolean;
  similarity: number; // 0-100%
  totalAttempts: number;
  message: string;
}

export interface ChildQuizResult {
  id: string;
  parentId: string;
  question: string;
  answer: string;
  reward?: string;
  quizDate: string;
  isActive: boolean;
  createdAt: string;
  childResult: QuizResultInfo;
}

export interface AllChildrenQuizzesResponse {
  childId: string;
  childName: string;
  completedQuizzes: ChildQuizResult[];
}