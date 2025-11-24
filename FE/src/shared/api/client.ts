import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import type { ApiResponse } from '@shared-types';
import { MOCK_CONFIG } from './mock/mockConfig';

// 서비스별 베이스 URL 설정
export const SERVICE_URLS = {
  USER: 'http://localhost',
  CONVERSATION: 'http://localhost',
  QUIZ: 'http://localhost',
  ARK: 'http://localhost',
  MEDIA: 'http://localhost',
  GATEWAY: 'http://localhost',
};

// 토큰 저장/관리 유틸리티
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('access_token');
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('refresh_token');
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // 병렬 저장으로 성능 향상
      await Promise.all([
        SecureStore.setItemAsync('access_token', accessToken),
        SecureStore.setItemAsync('refresh_token', refreshToken),
      ]);

      // 저장 완료 후 잠시 대기하여 안정성 확보
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error('토큰 저장 실패:', error);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};

// 토큰 갱신 콜백 함수 타입
type TokenRefreshCallback = (accessToken: string, refreshToken: string) => void;
type LogoutCallback = () => void;

// 콜백 함수들을 저장할 변수
let tokenRefreshCallback: TokenRefreshCallback | null = null;
let logoutCallback: LogoutCallback | null = null;

// 토큰 갱신 중복 방지
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

// 콜백 함수 설정
export const setTokenCallbacks = (
  onTokenRefresh: TokenRefreshCallback,
  onLogout: LogoutCallback,
) => {
  tokenRefreshCallback = onTokenRefresh;
  logoutCallback = onLogout;
};

// 공통 API 클라이언트 생성 함수
export const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    // headers: {
    //   'Content-Type': 'application/json',
    // },
  });

  // 요청 인터셉터: 요청 시 토큰 자동 추가
  client.interceptors.request.use(
    async (config) => {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;

        // Mock 모드가 아닐 때만 토큰 디버깅 및 검증 수행
        // 토큰 디버깅 로그는 모두 주석 처리 또는 제거
        // (필요 시 개발자가 직접 주석 해제하여 사용)
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // 응답 인터셉터: 토큰 만료 시 자동 갱신
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Mock 모드일 때는 토큰 갱신 로직 건너뛰기
      if (MOCK_CONFIG.USE_MOCK_API) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // 이미 토큰 갱신 중인 경우 대기열에 추가
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (refreshToken) {
            // 새로운 토큰을 받아오는 API 호출 (유저 서비스에서)
            const response = await axios.post(
              `${SERVICE_URLS.USER}/api/users/refresh`,
              {
                refresh_token: refreshToken,
              },
            );

            if (!response.data?.success || !response.data?.data) {
              throw new Error('Invalid refresh response structure');
            }

            const { access_token, refresh_token: newRefreshToken } =
              response.data.data;

            if (!access_token || !newRefreshToken) {
              throw new Error('Missing tokens in refresh response');
            }

            // 새 토큰 유효성 검증 (Mock 모드가 아닐 때만)
            if (!MOCK_CONFIG.USE_MOCK_API) {
              try {
                const tokenParts = access_token.split('.');
                if (tokenParts.length === 3) {
                  const payload = JSON.parse(atob(tokenParts[1]));
                  const now = new Date().getTime() / 1000;
                  if (payload.exp && payload.exp < now) {
                    throw new Error('Refreshed token is already expired');
                  }
                }
              } catch (validationError) {
                throw new Error('Invalid refreshed token');
              }
            }

            // 토큰 저장
            await tokenStorage.setTokens(access_token, newRefreshToken);

            // AuthProvider 상태 업데이트 (콜백이 설정된 경우)
            if (tokenRefreshCallback) {
              tokenRefreshCallback(access_token, newRefreshToken);
            }

            // 대기열 처리 - 모든 대기 중인 요청에 새 토큰 제공
            failedQueue.forEach(({ resolve }) => {
              resolve(access_token);
            });
            failedQueue = [];
            isRefreshing = false;

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return client(originalRequest);
          } else {
            throw new Error('No refresh token available');
          }
        } catch (refreshError) {
          // 대기열 처리 - 모든 대기 중인 요청 실패 처리
          failedQueue.forEach(({ reject }) => {
            reject(refreshError);
          });
          failedQueue = [];
          isRefreshing = false;

          // 토큰 갱신 실패 시 로그아웃 처리
          await tokenStorage.clearTokens();

          // AuthProvider 로그아웃 콜백 호출 (콜백이 설정된 경우)
          if (logoutCallback) {
            logoutCallback();
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

// API 응답 처리 헬퍼
export const handleApiResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'API 호출 실패');
};
