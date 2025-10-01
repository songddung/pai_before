// 백엔드 shared-types 재사용
export type {
  LoginDto as LoginRequest,
  CreateUserDto as SignupRequest,
  UserResponse as User,
  LoginResponse,
} from '@shared-types';

// 프론트엔드 전용 타입
export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 백엔드 타입 재import (편의성)
import type { UserResponse } from '@shared-types';