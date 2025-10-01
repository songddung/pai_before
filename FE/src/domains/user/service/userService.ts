import { userApi } from '../api/userApi';
import { tokenStorage } from '../../../shared/api/client';
// 타입 정의 (shared-types 대신 로컬 정의)
interface LoginDto {
  email: string;
  password: string;
}

interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

interface UserResponse {
  userId?: string;
  user_id?: string;
  email: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  created_at?: string;
}

export class UserService {
  // 로그인 처리
  static async login(loginData: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
  }> {
    try {
      const response = await userApi.login(loginData);

      // 토큰 저장 (accessToken, refreshToken 분리)
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);

      // 임시: 로그인 데이터로 사용자 정보 생성 (백엔드에 user 조회 API 없음)
      const mockUser: UserResponse = {
        userId: 'temp-user-id', // JWT에서 추출될 실제 값으로 대체됨
        email: loginData.email,
        address: 'Unknown Address',
        latitude: 0,
        longitude: 0,
        createdAt: new Date().toISOString(),
      };

      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: mockUser,
      };
    } catch (error) {
      console.error('Login service error:', error);
      throw new Error(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  }

  // 회원가입 처리
  static async signup(signupData: CreateUserDto): Promise<UserResponse> {
    try {
      const user = await userApi.register(signupData);
      return user;
    } catch (error) {
      console.error('Signup service error:', error);
      throw new Error(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    }
  }

  // 로그아웃 처리
  static async logout(): Promise<void> {
    try {
      await userApi.logout();
      await tokenStorage.clearTokens();
    } catch (error) {
      console.error('Logout service error:', error);
      // 로그아웃은 API 실패해도 로컬 토큰은 삭제
      await tokenStorage.clearTokens();
    }
  }

  // 현재 저장된 토큰 확인
  static async getCurrentToken(): Promise<string | null> {
    return await tokenStorage.getAccessToken();
  }

  // 토큰 저장
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await tokenStorage.setTokens(accessToken, refreshToken);
  }

  // 이메일 유효성 검사
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 비밀번호 유효성 검사
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' };
    }
    return { isValid: true };
  }
}