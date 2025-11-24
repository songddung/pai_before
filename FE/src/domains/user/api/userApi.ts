import {
  createApiClient,
  SERVICE_URLS,
  handleApiResponse,
} from '../../../shared/api/client';
import {
  UserResponse,
  ProfileResponse,
  CreateUserDto,
  LoginDto,
  CreateProfileDto,
  LoginResponse,
} from '@shared-types';
import { MOCK_CONFIG, userMockApi, profileMockApi } from '../../../shared/api/mock';

// 유저 서비스 전용 API 클라이언트
const userApiClient = createApiClient(SERVICE_URLS.USER);

// 사용자 인증 API
export const userApi = {
  // 회원가입
  async register(userData: CreateUserDto): Promise<UserResponse> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return userMockApi.register(userData);
    }
    const response = await userApiClient.post('/api/users', userData);
    return handleApiResponse(response);
  },

  // 로그인
  async login(credentials: LoginDto): Promise<LoginResponse> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return userMockApi.login(credentials);
    }
    const response = await userApiClient.post('/api/users/login', credentials);
    return handleApiResponse(response);
  },

  // 로그아웃
  async logout(): Promise<void> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return userMockApi.logout();
    }
    const response = await userApiClient.post('/api/users/logout');
    return handleApiResponse(response);
  },

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return userMockApi.refreshToken(refreshToken);
    }
    const response = await userApiClient.post('/api/users/refresh', {
      refresh_token: refreshToken,
    });
    return handleApiResponse(response);
  },
};

// 프로필 관리 API
export const profileApi = {
  // 프로필 생성
  async createProfile(profileData: CreateProfileDto): Promise<ProfileResponse> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.createProfile(profileData);
    }
    const response = await userApiClient.post('/api/profile', profileData);
    return handleApiResponse<ProfileResponse>(response);
  },

  // 프로필 목록 조회
  async getAllProfiles(): Promise<ProfileResponse[]> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.getAllProfiles();
    }
    const response = await userApiClient.get('/api/profile');
    return handleApiResponse<ProfileResponse[]>(response);
  },

  // 프로필 선택 (PIN 검증 포함)
  async selectProfile(
    profileId: string,
    profileType: 'PARENT' | 'CHILD',
    pin?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.selectProfile 호출:', { profileId, profileType, pin: pin ? '****' : undefined });
    }

    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.selectProfile(profileId, profileType, pin);
    }

    const body: any = {
      profile_type: profileType,
    };

    // 부모 프로필 선택 시 PIN 포함
    if (profileType === 'PARENT' && pin) {
      body.pin = pin;
    }

    const response = await userApiClient.post(
      `/api/profile/${profileId}/select`,
      body,
    );

    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.selectProfile 원본 응답:', response.data);
    }

    const result = handleApiResponse<{ access_token: string; refresh_token: string }>(response);

    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.selectProfile 처리된 결과:', result);
    }

    return result;
  },

  // 프로필 수정
  async updateProfile(
    profileId: string,
    profileData: any,
  ): Promise<ProfileResponse> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.updateProfile(profileId, profileData);
    }
    const response = await userApiClient.patch(
      `/api/profile/${profileId}`,
      profileData,
    );
    return handleApiResponse(response);
  },

  // 프로필 삭제
  async deleteProfile(profileId: string): Promise<void> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.deleteProfile(profileId);
    }
    const response = await userApiClient.delete(`/api/profile/${profileId}`);
    return handleApiResponse(response);
  },

  // PIN 설정
  async updatePin(profileId: string, pin: string): Promise<void> {
    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.updatePin(profileId, pin);
    }
    const response = await userApiClient.patch(
      `/api/profile/${profileId}/pin`,
      { pin },
    );
    return handleApiResponse(response);
  },

  // PIN 검증
  async verifyPin(profileId: string, pin: string): Promise<{ valid: boolean }> {
    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.verifyPin 호출:', { profileId, pin });
    }

    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.verifyPin(profileId, pin);
    }

    const response = await userApiClient.post(
      `/api/profile/${profileId}/pin/verify`,
      { pin },
    );

    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.verifyPin 원본 응답:', response.data);
    }

    const result = handleApiResponse<{ valid: boolean }>(response);

    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.verifyPin 처리된 결과:', result);
    }

    return result;
  },

  // 음성 등록
  async registerVoice(profileId: string, audioUri: string): Promise<{ voice_id: string }> {
    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.registerVoice 호출:', { profileId, audioUri });
    }

    if (MOCK_CONFIG.USE_MOCK_API) {
      return profileMockApi.registerVoice(profileId, audioUri);
    }

    const formData = new FormData();

    // 오디오 파일 추가
    const filename = `voice_${Date.now()}.wav`;
    formData.append('audio_file', {
      uri: audioUri,
      name: filename,
      type: 'audio/wav',
    } as any);

    const response = await userApiClient.post(
      `/api/profile/${profileId}/voice`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.registerVoice 원본 응답:', response.data);
    }

    const result = handleApiResponse<{ voice_id: string }>(response);

    if (!MOCK_CONFIG.USE_MOCK_API) {
      console.log('profileApi.registerVoice 처리된 결과:', result);
    }

    return result;
  },
};
