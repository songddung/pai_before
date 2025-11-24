import { delay, mockLog } from './mockConfig';

// Mock 대화 데이터 저장소
interface MockConversation {
  conversationId: string;
  title?: string;
  initialImageS3Url?: string;
  questions: {
    questionText: string;
    answerText: string;
    vqaDirectAnswer?: string;
    questionOrder: number;
  }[];
  messages: {
    role: 'user' | 'ai';
    text: string;
    imageUrl?: string;
    timestamp: string;
  }[];
  summary?: string;
  status: 'active' | 'ended';
  createdAt: string;
  endedAt?: string;
}

const mockConversations: Map<string, MockConversation> = new Map();
let conversationIdCounter = 1;

// AI 응답 예시 목록
const AI_RESPONSES = [
  '정말 재미있는 이야기네요! 더 자세히 들려주실래요?',
  '와, 대단해요! 그 다음엔 어떻게 됐나요?',
  '아주 멋진 생각이에요! 그것에 대해 더 알려주세요.',
  '흥미롭네요! 왜 그렇게 생각하셨나요?',
  '정말 신기하네요! 어떤 기분이 드셨어요?',
  '우와, 그럼 더 궁금한 게 생기는데요?',
  '좋은 질문이에요! 함께 생각해볼까요?',
  '그렇군요! 또 다른 생각도 있나요?',
];

// Mock 이미지 대화 데이터
interface MockConversationImage {
  conversationId: string;
  childId: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

const mockConversationImages: MockConversationImage[] = [
  {
    conversationId: 'conv-001',
    childId: '2',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    title: '우리 가족 여행',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    conversationId: 'conv-002',
    childId: '2',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    title: '내가 그린 그림',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    conversationId: 'conv-003',
    childId: '3',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    title: '강아지랑 놀기',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    conversationId: 'conv-004',
    childId: '2',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    title: '생일 파티',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

/**
 * Conversation API Mock 함수들
 */
export const conversationMockApi = {
  // 대화 시작
  async startConversation(data: {
    title?: string;
    initialImageS3Url?: string;
    questions: {
      questionText: string;
      answerText: string;
      vqaDirectAnswer?: string;
      questionOrder: number;
    }[];
  }): Promise<{ conversationId: string }> {
    await delay();
    mockLog('conversationApi.startConversation', 'POST', data);

    const conversationId = `conv-${String(conversationIdCounter++).padStart(3, '0')}`;

    const newConversation: MockConversation = {
      conversationId,
      title: data.title || '새로운 대화',
      initialImageS3Url: data.initialImageS3Url,
      questions: data.questions,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    mockConversations.set(conversationId, newConversation);

    return { conversationId };
  },

  // 대화 종료
  async endConversation(
    conversationId: string,
    data?: { summary?: string },
  ): Promise<void> {
    await delay();
    mockLog('conversationApi.endConversation', 'POST', { conversationId, data });

    const conversation = mockConversations.get(conversationId);

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    conversation.status = 'ended';
    conversation.endedAt = new Date().toISOString();
    conversation.summary = data?.summary || '즐거운 대화였어요!';

    mockConversations.set(conversationId, conversation);
  },

  // 대화 상세 조회
  async getConversation(conversationId: string): Promise<MockConversation> {
    await delay();
    mockLog('conversationApi.getConversation', 'GET', { conversationId });

    const conversation = mockConversations.get(conversationId);

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    return conversation;
  },

  // 대화 이미지 목록 조회
  async getConversationImages(params: {
    childId: string;
    page?: number;
    limit?: number;
  }): Promise<{
    conversations: MockConversationImage[];
    total: number;
    page: number;
    limit: number;
  }> {
    await delay();
    mockLog('conversationApi.getConversationImages', 'GET', params);

    const page = params.page || 1;
    const limit = params.limit || 10;

    // childId로 필터링
    const filtered = mockConversationImages.filter(
      img => img.childId === params.childId,
    );

    // 페이지네이션
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      conversations: paginated,
      total: filtered.length,
      page,
      limit,
    };
  },

  // Redis 대화 데이터 조회 (디버깅용)
  async getRedisConversationData(conversationId: string): Promise<any> {
    await delay();
    mockLog('conversationApi.getRedisConversationData', 'GET', { conversationId });

    const conversation = mockConversations.get(conversationId);

    if (!conversation) {
      return { error: 'Conversation not found in Redis' };
    }

    return {
      conversationId: conversation.conversationId,
      status: conversation.status,
      messageCount: conversation.messages.length,
      lastActivity: conversation.messages[conversation.messages.length - 1]?.timestamp || conversation.createdAt,
    };
  },

  // 메시지 전송 및 AI 응답 받기
  async sendMessage(data: {
    conversationId: string;
    message: string;
    imageUri?: string;
  }): Promise<{ text: string; audioUrl?: string }> {
    await delay(800); // 조금 더 긴 지연 시간으로 AI 응답 시뮬레이션
    mockLog('conversationApi.sendMessage', 'POST', {
      conversationId: data.conversationId,
      message: data.message.substring(0, 50),
    });

    const conversation = mockConversations.get(data.conversationId);

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    if (conversation.status !== 'active') {
      throw new Error('이미 종료된 대화입니다.');
    }

    // 사용자 메시지 저장
    const userMessage = {
      role: 'user' as const,
      text: data.message,
      imageUrl: data.imageUri,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(userMessage);

    // AI 응답 생성 (랜덤)
    const aiResponseText =
      AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];

    const aiMessage = {
      role: 'ai' as const,
      text: aiResponseText,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(aiMessage);

    mockConversations.set(data.conversationId, conversation);

    return {
      text: aiResponseText,
      audioUrl: undefined, // Mock에서는 오디오 생성 안함
    };
  },
};
