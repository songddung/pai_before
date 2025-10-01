import { createApiClient, SERVICE_URLS, handleApiResponse } from '../../../shared/api/client';

// 대화 서비스 전용 API 클라이언트
const conversationApiClient = createApiClient(SERVICE_URLS.CONVERSATION);

interface StartConversationRequest {
  title?: string;
  initialImageS3Url?: string;
  questions: {
    questionText: string;
    answerText: string;
    vqaDirectAnswer?: string;
    questionOrder: number;
  }[];
}

interface EndConversationRequest {
  summary?: string;
}

interface ConversationImagesQuery {
  childId: string;
  page?: number;
  limit?: number;
}

interface SendMessageRequest {
  conversationId: string;
  message: string;
  imageUri?: string;
}

interface AIResponse {
  text: string;
  audioUrl?: string;
}

interface StartConversationResponse {
  conversationId: string;
}

export const conversationApi = {
  // 대화 시작
  async startConversation(data: StartConversationRequest): Promise<StartConversationResponse> {
    const response = await conversationApiClient.post('/api/conversations/start', data);
    return handleApiResponse<StartConversationResponse>(response);
  },

  // 대화 종료
  async endConversation(conversationId: string, data?: EndConversationRequest) {
    const response = await conversationApiClient.post(`/api/conversations/${conversationId}/end`, data || {});
    return handleApiResponse(response);
  },

  // 대화 상세 조회
  async getConversation(conversationId: string) {
    const response = await conversationApiClient.get(`/api/conversations/${conversationId}`);
    return handleApiResponse(response);
  },

  // 대화 이미지 목록 조회
  async getConversationImages(params: ConversationImagesQuery) {
    const queryParams = new URLSearchParams({
      childId: params.childId,
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    const response = await conversationApiClient.get(`/api/conversations/images?${queryParams}`);
    return handleApiResponse(response);
  },

  // Redis 대화 데이터 조회 (개발/디버깅용)
  async getRedisConversationData(conversationId: string) {
    const response = await conversationApiClient.get(`/api/conversations/${conversationId}/redis-data`);
    return handleApiResponse(response);
  },

  // 메시지 전송 및 AI 응답 받기
  async sendMessage(data: SendMessageRequest): Promise<AIResponse> {
    const formData = new FormData();
    formData.append('message', data.message);

    if (data.imageUri) {
      formData.append('image', {
        uri: data.imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
    }

    const response = await conversationApiClient.post(
      `/api/conversations/${data.conversationId}/message`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return handleApiResponse<AIResponse>(response);
  },
};