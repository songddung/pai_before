import { delay, mockLog } from './mockConfig';

// Mock 퀴즈 데이터 구조
interface MockQuiz {
  id: string;
  parentId: string;
  question: string;
  answer: string;
  reward?: string;
  quizDate: string;
  isActive: boolean;
  createdAt: string;
}

interface MockQuizResult {
  quizId: string;
  childId: string;
  isSolved: boolean;
  similarity: number;
  totalAttempts: number;
  rewardGiven: boolean;
  lastAttemptAt: string;
}

// Mock 데이터 저장소
const mockQuizzes: Map<string, MockQuiz> = new Map();
const mockQuizResults: Map<string, MockQuizResult> = new Map(); // key: quizId-childId

let quizIdCounter = 1;

// 초기 Mock 퀴즈 데이터
const INITIAL_QUIZZES: MockQuiz[] = [
  {
    id: 'quiz-001',
    parentId: '1',
    question: '오늘 날씨가 어땠어?',
    answer: '맑았어요',
    reward: '아이스크림',
    quizDate: new Date().toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quiz-002',
    parentId: '1',
    question: '유치원에서 제일 재미있었던 일은?',
    answer: '친구들이랑 놀이터에서 놀았어요',
    reward: '스티커',
    quizDate: new Date().toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quiz-003',
    parentId: '1',
    question: '오늘 점심에 뭐 먹었어?',
    answer: '카레라이스',
    quizDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    isActive: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// 초기 퀴즈 결과 데이터
const INITIAL_RESULTS: MockQuizResult[] = [
  {
    quizId: 'quiz-003',
    childId: '2',
    isSolved: true,
    similarity: 95,
    totalAttempts: 1,
    rewardGiven: true,
    lastAttemptAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// 초기 데이터 세팅
INITIAL_QUIZZES.forEach(quiz => mockQuizzes.set(quiz.id, quiz));
INITIAL_RESULTS.forEach(result => {
  mockQuizResults.set(`${result.quizId}-${result.childId}`, result);
});

/**
 * 텍스트 유사도 계산 (간단한 mock 버전)
 */
function calculateSimilarity(answer: string, correctAnswer: string): number {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .trim();

  const normalizedAnswer = normalize(answer);
  const normalizedCorrect = normalize(correctAnswer);

  // 정확히 일치
  if (normalizedAnswer === normalizedCorrect) return 100;

  // 포함 관계
  if (
    normalizedAnswer.includes(normalizedCorrect) ||
    normalizedCorrect.includes(normalizedAnswer)
  ) {
    return 80;
  }

  // 단어 매칭
  const answerWords = normalizedAnswer.split(/\s+/);
  const correctWords = normalizedCorrect.split(/\s+/);
  const matchCount = answerWords.filter(word =>
    correctWords.some(cw => cw.includes(word) || word.includes(cw)),
  ).length;

  if (matchCount > 0) {
    return Math.min(70, (matchCount / correctWords.length) * 100);
  }

  return 30; // 기본값
}

/**
 * Quiz API Mock 함수들
 */
export const quizMockApi = {
  // 퀴즈 생성 (부모 전용)
  async createQuiz(data: {
    question: string;
    answer: string;
    reward?: string;
  }): Promise<MockQuiz> {
    await delay();
    mockLog('quizApi.createQuiz', 'POST', data);

    const quizId = `quiz-${String(quizIdCounter++).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newQuiz: MockQuiz = {
      id: quizId,
      parentId: '1', // Mock에서는 고정
      question: data.question,
      answer: data.answer,
      reward: data.reward,
      quizDate: today,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockQuizzes.set(quizId, newQuiz);
    return newQuiz;
  },

  // 퀴즈 수정 (부모 전용)
  async updateQuiz(
    quizId: string,
    data: Partial<{ question: string; answer: string; reward?: string }>,
  ): Promise<MockQuiz> {
    await delay();
    mockLog('quizApi.updateQuiz', 'PATCH', { quizId, data });

    const quiz = mockQuizzes.get(quizId);

    if (!quiz) {
      throw new Error('퀴즈를 찾을 수 없습니다.');
    }

    const updatedQuiz = {
      ...quiz,
      ...data,
    };

    mockQuizzes.set(quizId, updatedQuiz);
    return updatedQuiz;
  },

  // 퀴즈 삭제 (부모 전용)
  async deleteQuiz(quizId: string): Promise<void> {
    await delay();
    mockLog('quizApi.deleteQuiz', 'DELETE', { quizId });

    if (!mockQuizzes.has(quizId)) {
      throw new Error('퀴즈를 찾을 수 없습니다.');
    }

    mockQuizzes.delete(quizId);

    // 관련 결과도 삭제
    const keysToDelete: string[] = [];
    mockQuizResults.forEach((result, key) => {
      if (result.quizId === quizId) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => mockQuizResults.delete(key));
  },

  // 오늘 퀴즈 목록 조회 (아이 전용)
  async getAvailableQuizzes(childId: string = '2'): Promise<
    {
      id: string;
      parentId: string;
      question: string;
      reward?: string;
      quizDate: string;
      isActive: boolean;
      myResult: {
        isSolved: boolean;
        totalAttempts: number;
        rewardGiven: boolean;
      } | null;
    }[]
  > {
    await delay();
    mockLog('quizApi.getAvailableQuizzes', 'GET', { childId });

    const today = new Date().toISOString().split('T')[0];

    // 오늘 날짜의 퀴즈만 필터링
    const todayQuizzes = Array.from(mockQuizzes.values()).filter(
      quiz => quiz.quizDate === today,
    );

    // 각 퀴즈에 대한 결과 포함
    return todayQuizzes.map(quiz => {
      const resultKey = `${quiz.id}-${childId}`;
      const result = mockQuizResults.get(resultKey);

      return {
        id: quiz.id,
        parentId: quiz.parentId,
        question: quiz.question,
        reward: quiz.reward,
        quizDate: quiz.quizDate,
        isActive: result ? !result.isSolved : true, // 풀었으면 비활성화
        myResult: result
          ? {
              isSolved: result.isSolved,
              totalAttempts: result.totalAttempts,
              rewardGiven: result.rewardGiven,
            }
          : null,
      };
    });
  },

  // 퀴즈 제출 (아이 전용)
  async submitQuiz(
    quizId: string,
    data: { answer: string },
    childId: string = '2',
  ): Promise<{
    isSolved: boolean;
    similarity: number;
    totalAttempts: number;
    message: string;
  }> {
    await delay(1000); // 채점 시뮬레이션
    mockLog('quizApi.submitQuiz', 'POST', { quizId, answer: data.answer });

    const quiz = mockQuizzes.get(quizId);

    if (!quiz) {
      throw new Error('퀴즈를 찾을 수 없습니다.');
    }

    const resultKey = `${quizId}-${childId}`;
    let result = mockQuizResults.get(resultKey);

    // 유사도 계산
    const similarity = calculateSimilarity(data.answer, quiz.answer);
    const isSolved = similarity >= 70; // 70% 이상이면 정답

    if (!result) {
      // 첫 시도
      result = {
        quizId,
        childId,
        isSolved,
        similarity,
        totalAttempts: 1,
        rewardGiven: false,
        lastAttemptAt: new Date().toISOString(),
      };
    } else {
      // 재시도
      result.totalAttempts += 1;
      result.similarity = Math.max(result.similarity, similarity);
      result.isSolved = result.isSolved || isSolved;
      result.lastAttemptAt = new Date().toISOString();
    }

    mockQuizResults.set(resultKey, result);

    // 메시지 생성
    let message = '';
    if (isSolved) {
      message = '정답입니다! 정말 잘했어요! 🎉';
    } else if (similarity >= 50) {
      message = '거의 다 왔어요! 조금만 더 생각해볼까요?';
    } else {
      message = '다시 한번 생각해보세요. 힌트: ' + quiz.answer.substring(0, 2) + '...';
    }

    return {
      isSolved: result.isSolved,
      similarity: result.similarity,
      totalAttempts: result.totalAttempts,
      message,
    };
  },

  // 자녀 퀴즈 결과 조회 (부모 전용)
  async getChildrenQuizResults(): Promise<
    {
      childId: string;
      childName: string;
      completedQuizzes: {
        id: string;
        parentId: string;
        question: string;
        answer: string;
        reward?: string;
        quizDate: string;
        isActive: boolean;
        createdAt: string;
        childResult: {
          isSolved: boolean;
          totalAttempts: number;
          rewardGiven: boolean;
        };
      }[];
    }[]
  > {
    await delay();
    mockLog('quizApi.getChildrenQuizResults', 'GET');

    // 자녀별로 그룹화
    const childrenMap = new Map<
      string,
      {
        childId: string;
        childName: string;
        completedQuizzes: any[];
      }
    >();

    // 모든 결과를 순회
    mockQuizResults.forEach((result, key) => {
      if (!result.isSolved) return; // 미해결 퀴즈는 제외

      const quiz = mockQuizzes.get(result.quizId);
      if (!quiz) return;

      if (!childrenMap.has(result.childId)) {
        childrenMap.set(result.childId, {
          childId: result.childId,
          childName: result.childId === '2' ? '정유진' : '김민규',
          completedQuizzes: [],
        });
      }

      const childData = childrenMap.get(result.childId)!;
      childData.completedQuizzes.push({
        id: quiz.id,
        parentId: quiz.parentId,
        question: quiz.question,
        answer: quiz.answer,
        reward: quiz.reward,
        quizDate: quiz.quizDate,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt,
        childResult: {
          isSolved: result.isSolved,
          totalAttempts: result.totalAttempts,
          rewardGiven: result.rewardGiven,
        },
      });
    });

    return Array.from(childrenMap.values());
  },

  // 보상 지급 (부모 전용)
  async giveReward(quizResultId: string): Promise<void> {
    await delay();
    mockLog('quizApi.giveReward', 'PATCH', { quizResultId });

    // quizResultId는 실제로는 quizId-childId 형태로 가정
    // 또는 quizId만 전달되는 경우 모든 자녀에게 보상 지급

    let updated = false;

    mockQuizResults.forEach((result, key) => {
      // quizResultId가 quizId를 포함하는 경우 (간단한 매칭)
      if (key.startsWith(quizResultId) || result.quizId === quizResultId) {
        if (result.isSolved && !result.rewardGiven) {
          result.rewardGiven = true;
          mockQuizResults.set(key, result);
          updated = true;
        }
      }
    });

    if (!updated) {
      console.log('[MOCK] 보상을 지급할 퀴즈 결과를 찾지 못했습니다:', quizResultId);
    }
  },
};
