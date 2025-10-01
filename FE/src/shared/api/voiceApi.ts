import { SERVICE_URLS, tokenStorage } from './client';
import axios from 'axios';

export interface GuideScriptsResponse {
  ko: string[];
  en: string[];
}

export interface VoiceProfileResponse {
  profile_id: string;
  account_id: string;
  profile_name: string;
  message: string;
  media_id?: string; // .pt 파일의 media_id
  embedding_url?: string; // S3에 저장된 .pt 파일 URL
}

export const voiceApi = {
  // 가이드 스크립트 가져오기
  async getGuideScripts(): Promise<GuideScriptsResponse> {
    console.log('=== 가이드 스크립트 요청 ===');

    try {
      const token = await tokenStorage.getAccessToken();

      const response = await axios.get(
        `${SERVICE_URLS.MEDIA}/tts/voice-profiles/scripts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('가이드 스크립트 응답:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '가이드 스크립트 요청 실패:',
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // 음성 프로필 생성 (최적화된 흐름: FE → AI Integration → .pt파일만 S3저장)
  async createVoiceProfile(
    accountId: string,
    profileName: string,
    audioUri: string,
  ): Promise<VoiceProfileResponse> {
    console.log('=== 음성 프로필 생성 시작 (직접 전송) ===');
    console.log('계정 ID:', accountId);
    console.log('프로필 이름:', profileName);
    console.log('오디오 URI:', audioUri);

    try {
      const token = await tokenStorage.getAccessToken();
      console.log('인증 토큰:', token ? '존재함' : '없음');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // AI Integration에 직접 원본 음성파일 전송
      const filename = `voice_${Date.now()}.wav`;
      const formData = new FormData();

      formData.append('audio_file', {
        uri: audioUri,
        name: filename,
        type: 'audio/wav',
      } as any);
      formData.append('account_id', accountId);
      formData.append('profile_name', profileName);

      console.log('요청 URL:', `${SERVICE_URLS.MEDIA}/tts/voice-profiles`);
      console.log('AI Integration에 음성 프로필 생성 요청 (직접 전송)');

      const response = await axios.post(
        `${SERVICE_URLS.MEDIA}/tts/voice-profiles`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // AI 처리시간 고려해서 60초
        },
      );

      console.log('음성 프로필 생성 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== 음성 프로필 생성 실패 상세 정보 ===');
      console.error('상태 코드:', error.response?.status);
      console.error('응답 데이터:', error.response?.data);
      console.error('요청 URL:', error.config?.url);
      console.error('요청 메서드:', error.config?.method);
      console.error('에러 메시지:', error.message);
      throw error;
    }
  },

  // 임시 테스트용: AI Integration에 직접 전송
  async createVoiceProfileDirect(
    accountId: string,
    profileName: string,
    audioUri: string,
  ): Promise<VoiceProfileResponse> {
    console.log('=== 임시 테스트: AI Integration 직접 전송 ===');
    console.log('계정 ID:', accountId);
    console.log('프로필 이름:', profileName);
    console.log('오디오 URI:', audioUri);

    try {
      const token = await tokenStorage.getAccessToken();

      // 오디오 파일명 생성
      const filename = `voice_${Date.now()}.wav`;

      const formData = new FormData();

      // React Native에서 FormData에 오디오 파일 추가
      formData.append('audio_file', {
        uri: audioUri,
        name: filename,
        type: 'audio/wav',
      } as any);

      formData.append('account_id', accountId);
      formData.append('profile_name', profileName);

      console.log('FormData 생성 완료');

      // TTS 서비스로 음성 프로필 생성 요청 (직접)
      const response = await axios.post(
        `${SERVICE_URLS.MEDIA}/tts/voice-profiles`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30초 타임아웃 (음성 처리 시간 고려)
        },
      );

      console.log('음성 프로필 생성 성공 (직접):', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '음성 프로필 생성 실패 (직접):',
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // 사용자의 음성 프로필 목록 조회
  async getVoiceProfiles(accountId: string): Promise<VoiceProfileResponse[]> {
    console.log('=== 음성 프로필 목록 조회 ===');
    console.log('계정 ID:', accountId);

    try {
      const token = await tokenStorage.getAccessToken();

      const response = await axios.get(
        `${SERVICE_URLS.MEDIA}/tts/voice-profiles/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('음성 프로필 목록:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '음성 프로필 목록 조회 실패:',
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // 텍스트를 음성으로 변환
  async textToSpeech(
    profileId: string,
    text: string,
    language: string = 'ko',
  ): Promise<Blob> {
    console.log('=== TTS 변환 요청 ===');
    console.log('프로필 ID:', profileId);
    console.log('텍스트:', text);
    console.log('언어:', language);

    try {
      const token = await tokenStorage.getAccessToken();

      const response = await axios.post(
        `${SERVICE_URLS.MEDIA}/tts/generate`,
        {
          profile_id: profileId,
          text: text,
          language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob', // 오디오 파일 응답
          timeout: 30000, // 30초 타임아웃
        },
      );

      console.log('TTS 변환 성공');
      return response.data;
    } catch (error: any) {
      console.error('TTS 변환 실패:', error.response?.data || error.message);
      throw error;
    }
  },
};
