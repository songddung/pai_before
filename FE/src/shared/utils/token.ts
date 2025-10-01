import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  sub: string;  // userId
  iat: number;  // issued at
  exp: number;  // expires
  profile_id?: number;  // 선택된 프로필 ID
  profile_type?: 'PARENT' | 'CHILD';  // 프로필 타입 (PARENT/CHILD)
  profile_name?: string;  // 프로필 이름 (JWT에서 사용)
  name?: string;  // 프로필 이름 (shared-types 호환)
  user_id?: string;  // 추가 userId 필드
  userId?: string;  // 추가 userId 필드
}

export const tokenUtils = {
  // JWT 토큰에서 userId 추출
  getUserIdFromToken(token: string): string | null {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      return payload.sub;
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  },

  // 토큰 만료 체크
  isTokenExpired(token: string): boolean {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  },

  // 토큰 만료까지 남은 시간 (초)
  getTokenTimeToExpiry(token: string): number {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;
      return Math.max(0, payload.exp - now);
    } catch (error) {
      return 0;
    }
  },

  // 전체 토큰 데이터 디코딩
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  },
};