import { createApiClient, SERVICE_URLS, handleApiResponse } from '../../../shared/api/client';

// 퀴즈 서비스 전용 API 클라이언트
const quizApiClient = createApiClient(SERVICE_URLS.QUIZ);

interface CreateQuizRequest {
  question: string;
  answer: string;
  reward?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface SubmitQuizRequest {
  answer: string;
}

interface RewardRequest {
  rewardType: string;
  amount?: number;
  message?: string;
}

interface QuizSubmitResult {
  isSolved: boolean;
  similarity: number;
  totalAttempts: number;
  message: string;
}

interface QuizResult {
  myResult?: {
    isSolved: boolean;
    score: number;
  };
  [key: string]: any;
}

export const quizApi = {
  // 퀴즈 생성 (부모 전용)
  async createQuiz(data: CreateQuizRequest) {
    const response = await quizApiClient.post('/api/quiz', data);
    return handleApiResponse(response);
  },

  // 퀴즈 수정 (부모 전용)
  async updateQuiz(quizId: string, data: Partial<CreateQuizRequest>) {
    const response = await quizApiClient.patch(`/api/quiz/${quizId}`, data);
    return handleApiResponse(response);
  },

  // 퀴즈 삭제 (부모 전용)
  async deleteQuiz(quizId: string) {
    const response = await quizApiClient.delete(`/api/quiz/${quizId}`);
    return handleApiResponse(response);
  },

  // 오늘 퀴즈 목록 조회 (아이 전용)
  async getAvailableQuizzes(): Promise<any[]> {
    const response = await quizApiClient.get('/api/quiz/available');
    return handleApiResponse<any[]>(response);
  },

  // 퀴즈 제출 (아이 전용)
  async submitQuiz(quizId: string, data: SubmitQuizRequest): Promise<QuizSubmitResult> {
    const response = await quizApiClient.post(`/api/quiz/${quizId}/submit`, data);
    return handleApiResponse<QuizSubmitResult>(response);
  },

  // 자녀 퀴즈 결과 조회 (부모 전용)
  async getChildrenQuizResults(): Promise<QuizResult[]> {
    const response = await quizApiClient.get('/api/quiz/children/completed');
    return handleApiResponse<QuizResult[]>(response);
  },

  // 보상 지급 (부모 전용)
  async giveReward(quizResultId: string) {
    console.log('giveReward API 호출:', {
      url: `/api/quiz/${quizResultId}/reward`,
      quizResultId: quizResultId
    });
    const response = await quizApiClient.patch(`/api/quiz/${quizResultId}/reward`);
    return handleApiResponse(response);
  },
};