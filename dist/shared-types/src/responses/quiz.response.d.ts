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
    isActive: boolean;
    myResult: QuizResultInfo | null;
}
export interface QuizSubmitResponse {
    isSolved: boolean;
    similarity: number;
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
