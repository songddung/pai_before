import { createApiClient, SERVICE_URLS, handleApiResponse } from './client';

// AI 서비스 전용 API 클라이언트 (Gateway를 통해 AI 서비스에 접근)
const aiApiClient = createApiClient(SERVICE_URLS.GATEWAY);

interface VQARequest {
  imageUrl: string;
  question: string;
  childName: string;
}

interface VQAResponse {
  answer: string;
  vqa_direct_answer: string;
  question: string;
  detected_object: string;
}

interface AIResponse {
  text: string;
  audioUrl?: string;
  vqaDirectAnswer?: string;
}

interface TTSRequest {
  text: string;
  account_id: string;
  profile_id: string;
}

export const aiApi = {
  // VQA (Visual Question Answering) API 호출
  async askVQA(data: VQARequest): Promise<VQAResponse> {
    const formData = new FormData();

    formData.append('image_url', data.imageUrl);
    formData.append('question', data.question);
    formData.append('child_name', data.childName);

    console.log('VQA 서비스 요청:', {
      imageUrl: data.imageUrl,
      question: data.question,
      childName: data.childName
    });

    const response = await aiApiClient.post('/api/ai/vqa/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // AI API는 직접 JSON 응답을 보내므로 handleApiResponse 사용하지 않음
    console.log('VQA 원본 응답:', response.data);

    // AI API 응답이 래핑되어 있는지 확인
    let result: VQAResponse;
    if (response.data.success !== undefined) {
      // 래핑된 응답인 경우
      result = handleApiResponse<VQAResponse>(response);
    } else {
      // 직접 응답인 경우
      result = response.data as VQAResponse;
    }

    console.log('VQA 서비스 응답:', result);

    return result;
  },

  // VQA 응답을 AI 응답 형태로 변환
  async sendMessage(data: {
    imageS3Url?: string;
    question: string;
    childName: string;
  }): Promise<AIResponse> {
    if (!data.imageS3Url) {
      throw new Error('이미지가 필요합니다');
    }

    const vqaResponse = await this.askVQA({
      imageUrl: data.imageS3Url,
      question: data.question,
      childName: data.childName,
    });

    return {
      text: vqaResponse.answer,
      vqaDirectAnswer: vqaResponse.vqa_direct_answer,
    };
  },

  // TTS (Text-to-Speech) 변환
  async textToSpeech(data: TTSRequest): Promise<{ audio_url: string }> {
    console.log('TTS 서비스 요청:', data);

    try {
      // JSON 형식으로 요청
      const requestBody = {
        profile_id: data.profile_id,
        account_id: data.account_id,
        text: data.text
      };

      console.log('TTS 요청 URL:', '/api/ai/tts/generate');
      console.log('TTS 요청 Body:', requestBody);

      const response = await aiApiClient.post('/api/ai/tts/generate', requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer', // 바이너리 데이터 수신
      });

      console.log('TTS 서비스 응답 타입:', typeof response.data);
      console.log('TTS 서비스 응답 크기:', response.data.byteLength);

      // React Native에서는 ArrayBuffer를 Base64로 변환
      const arrayBuffer = response.data;
      const uint8Array = new Uint8Array(arrayBuffer);

      // Base64 변환
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64Audio = btoa(binaryString);

      // Data URI 생성
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      console.log('생성된 오디오 URL 길이:', audioUrl.length);
      console.log('오디오 URL 프리픽스:', audioUrl.substring(0, 50));

      return { audio_url: audioUrl };
    } catch (error: any) {
      console.error('TTS API 호출 상세 오류:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: '/api/ai/tts/generate',
        requestData: data
      });
      throw error;
    }
  },

  // AI 서비스 상태 확인
  async checkHealth(): Promise<{ message: string }> {
    const response = await aiApiClient.get('/api/ai/');

    // AI API 응답이 래핑되어 있는지 확인
    if (response.data.success !== undefined) {
      // 래핑된 응답인 경우
      return handleApiResponse<{ message: string }>(response);
    } else {
      // 직접 응답인 경우
      return response.data as { message: string };
    }
  },
};