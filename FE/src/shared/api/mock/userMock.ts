import {
  UserResponse,
  ProfileResponse,
  CreateUserDto,
  LoginDto,
  CreateProfileDto,
  LoginResponse,
} from '@shared-types';
import { delay, mockLog } from './mockConfig';

// Mock 데이터 저장소
const mockUsers: Map<string, UserResponse & { password: string }> = new Map();
const mockProfiles: Map<number, ProfileResponse> = new Map();

// 초기 Mock 데이터 - 테스트용 사용자 및 프로필
const INITIAL_USER = {
  userId: 'user-001',
  email: 'test@example.com',
  password: 'password123',
  address: '서울특별시 강남구',
  latitude: 37.4979,
  longitude: 127.0276,
  createdAt: new Date().toISOString(),
};

const INITIAL_PROFILES: ProfileResponse[] = [
  {
    profile_id: 1,
    user_id: 'user-001',
    profile_type: 'PARENT',
    name: '송현광',
    birth_date: '1985-03-15',
    gender: 'MALE',
    avatar_media_id: 'piggy1',
    voice_media_id: 'voice-001',
    created_at: new Date().toISOString(),
  },
  {
    profile_id: 2,
    user_id: 'user-001',
    profile_type: 'CHILD',
    name: '정유진',
    birth_date: '2018-07-20',
    gender: 'FEMALE',
    avatar_media_id: 'piggy2',
    created_at: new Date().toISOString(),
  },
  {
    profile_id: 3,
    user_id: 'user-001',
    profile_type: 'CHILD',
    name: '김민규',
    birth_date: '2020-05-10',
    gender: 'MALE',
    avatar_media_id: 'piggy3',
    created_at: new Date().toISOString(),
  },
];

// 초기 데이터 세팅
mockUsers.set(INITIAL_USER.email, INITIAL_USER);
INITIAL_PROFILES.forEach(profile => {
  mockProfiles.set(profile.profile_id, profile);
});

// Mock 토큰 생성 헬퍼
const generateMockToken = (userId: string, profileId?: number): string => {
  const payload = {
    userId,
    profileId,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1시간 후 만료
  };
  return `mock.token.${btoa(JSON.stringify(payload))}`;
};

let profileIdCounter = 4;

/**
 * User API Mock 함수들
 */
export const userMockApi = {
  // 회원가입
  async register(userData: CreateUserDto): Promise<UserResponse> {
    await delay();
    mockLog('userApi.register', 'POST', userData);

    // 이메일 중복 체크
    if (mockUsers.has(userData.email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    const newUser: UserResponse & { password: string } = {
      userId: `user-${Date.now()}`,
      email: userData.email,
      password: userData.password,
      address: userData.address,
      latitude: 37.5665, // 기본값: 서울시청
      longitude: 126.9780,
      createdAt: new Date().toISOString(),
    };

    mockUsers.set(userData.email, newUser);

    const { password, ...userResponse } = newUser;
    return userResponse;
  },

  // 로그인
  async login(credentials: LoginDto): Promise<LoginResponse> {
    await delay();
    mockLog('userApi.login', 'POST', { email: credentials.email });

    const user = mockUsers.get(credentials.email);

    if (!user || user.password !== credentials.password) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return {
      accessToken: generateMockToken(user.userId),
      refreshToken: generateMockToken(user.userId),
    };
  },

  // 로그아웃
  async logout(): Promise<void> {
    await delay();
    mockLog('userApi.logout', 'POST');
    // Mock에서는 실제로 할 일이 없음
    return;
  },

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    await delay();
    mockLog('userApi.refreshToken', 'POST');

    // 간단한 토큰 파싱 (실제로는 JWT 검증)
    try {
      const tokenParts = refreshToken.split('.');
      if (tokenParts[0] === 'mock' && tokenParts[1] === 'token') {
        const payload = JSON.parse(atob(tokenParts[2]));
        return {
          access_token: generateMockToken(payload.userId),
          refresh_token: generateMockToken(payload.userId),
        };
      }
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.');
    }

    throw new Error('토큰 갱신에 실패했습니다.');
  },
};

/**
 * Profile API Mock 함수들
 */
export const profileMockApi = {
  // 프로필 생성
  async createProfile(profileData: CreateProfileDto): Promise<ProfileResponse> {
    await delay();
    mockLog('profileApi.createProfile', 'POST', profileData);

    const newProfile: ProfileResponse = {
      profile_id: profileIdCounter++,
      user_id: profileData.user_id,
      profile_type: profileData.profile_type,
      name: profileData.name,
      birth_date: profileData.birth_date,
      gender: profileData.gender,
      avatar_media_id: profileData.avatar_media_id,
      created_at: new Date().toISOString(),
    };

    mockProfiles.set(newProfile.profile_id, newProfile);
    return newProfile;
  },

  // 프로필 목록 조회
  async getAllProfiles(): Promise<ProfileResponse[]> {
    await delay();
    mockLog('profileApi.getAllProfiles', 'GET');

    // 현재는 모든 프로필 반환 (실제로는 user_id로 필터링)
    return Array.from(mockProfiles.values());
  },

  // 프로필 선택 (PIN 검증 포함)
  async selectProfile(
    profileId: string,
    profileType: 'PARENT' | 'CHILD',
    pin?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    await delay();
    mockLog('profileApi.selectProfile', 'POST', { profileId, profileType });

    console.log('[MOCK selectProfile] 시작:', {
      profileId,
      profileType,
      pin,
      pinType: typeof pin,
      pinLength: pin?.length,
    });

    const profile = mockProfiles.get(Number(profileId));

    if (!profile) {
      console.log('[MOCK selectProfile] 프로필을 찾을 수 없음');
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    console.log('[MOCK selectProfile] 프로필 찾음:', profile.name, profile.profile_type);

    // 부모 프로필은 반드시 PIN 검증 필요
    if (profileType === 'PARENT') {
      console.log('[MOCK selectProfile] 부모 프로필 PIN 검증 시작');
      console.log('[MOCK selectProfile] PIN 값:', pin);
      console.log('[MOCK selectProfile] PIN 비교: pin !== "1234":', pin !== '1234');
      console.log('[MOCK selectProfile] PIN 비교: !pin:', !pin);

      // PIN이 없거나 틀린 경우 에러
      if (!pin || pin !== '1234') {
        console.log('[MOCK selectProfile] PIN 검증 실패 - 에러 throw');
        throw new Error('PIN이 일치하지 않습니다.');
      }
      console.log('[MOCK selectProfile] PIN 검증 성공');
    }

    console.log('[MOCK selectProfile] 토큰 생성 및 반환');
    return {
      access_token: generateMockToken(profile.user_id, profile.profile_id),
      refresh_token: generateMockToken(profile.user_id, profile.profile_id),
    };
  },

  // 프로필 수정
  async updateProfile(profileId: string, profileData: any): Promise<ProfileResponse> {
    await delay();
    mockLog('profileApi.updateProfile', 'PATCH', { profileId, profileData });

    const profile = mockProfiles.get(Number(profileId));

    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    const updatedProfile = {
      ...profile,
      ...profileData,
    };

    mockProfiles.set(Number(profileId), updatedProfile);
    return updatedProfile;
  },

  // 프로필 삭제
  async deleteProfile(profileId: string): Promise<void> {
    await delay();
    mockLog('profileApi.deleteProfile', 'DELETE', { profileId });

    if (!mockProfiles.has(Number(profileId))) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    mockProfiles.delete(Number(profileId));
  },

  // PIN 설정
  async updatePin(profileId: string, pin: string): Promise<void> {
    await delay();
    mockLog('profileApi.updatePin', 'PATCH', { profileId });

    const profile = mockProfiles.get(Number(profileId));

    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    // Mock에서는 PIN을 별도로 저장하지 않음 (실제로는 DB에 저장)
    console.log(`[MOCK] Profile ${profileId} PIN updated`);
  },

  // PIN 검증
  async verifyPin(profileId: string, pin: string): Promise<{ valid: boolean }> {
    await delay();
    mockLog('profileApi.verifyPin', 'POST', { profileId });

    const profile = mockProfiles.get(Number(profileId));

    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    // Mock에서는 PIN을 1234로 가정
    const isValid = pin === '1234';
    console.log('[MOCK verifyPin] 입력된 PIN:', pin, '결과:', isValid);
    return { valid: isValid };
  },

  // 음성 등록
  async registerVoice(profileId: string, audioUri: string): Promise<{ voice_id: string }> {
    await delay();
    mockLog('profileApi.registerVoice', 'POST', { profileId, audioUri });

    const profile = mockProfiles.get(Number(profileId));

    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    const voiceId = `voice-${Date.now()}`;

    // 프로필에 voice_media_id 업데이트
    profile.voice_media_id = voiceId;
    mockProfiles.set(Number(profileId), profile);

    return { voice_id: voiceId };
  },
};
