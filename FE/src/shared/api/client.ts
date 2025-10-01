import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import type { ApiResponse } from '@shared-types';

// 서비스별 베이스 URL 설정
export const SERVICE_URLS = {
  USER: 'https://j13c101.p.ssafy.io',
  CONVERSATION: 'https://j13c101.p.ssafy.io',
  QUIZ: 'https://j13c101.p.ssafy.io',
  ARK: 'https://j13c101.p.ssafy.io',
  MEDIA: 'https://j13c101.p.ssafy.io',
  GATEWAY: 'https://j13c101.p.ssafy.io',
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
        SecureStore.setItemAsync('refresh_token', refreshToken)
      ]);

      // 저장 완료 후 잠시 대기하여 안정성 확보
      await new Promise(resolve => setTimeout(resolve, 50));
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
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = [];

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

        // 모든 API 요청에 대해 토큰 디버깅 (quiz, ark 등)
        if (config.url?.includes('/api/quiz') || config.url?.includes('/api/ark/')) {
          console.log('API 요청 토큰 디버깅:', {
            url: config.url,
            method: config.method,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + '...',
          });

          // JWT 토큰 디코딩 (검증용)
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('토큰 페이로드 상세:', {
                sub: payload.sub,
                profile_id: payload.profile_id,
                profile_type: payload.profile_type,
                profile_name: payload.profile_name,
                exp: payload.exp,
                iat: payload.iat,
                현재시간: new Date().getTime() / 1000,
                만료여부: payload.exp < (new Date().getTime() / 1000) ? '만료됨' : '유효함'
              });
            }
          } catch (decodeError) {
            console.error('토큰 디코딩 실패:', decodeError);
          }
        }
      } else {
        console.log('⚠️ 토큰이 없는 상태로 API 요청:', config.url);
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

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        console.log('토큰 만료 감지, 토큰 갱신 시도');

        // 이미 토큰 갱신 중인 경우 대기열에 추가
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (refreshToken) {
            console.log('리프레시 토큰으로 토큰 갱신 중:', {
              refreshTokenLength: refreshToken.length,
              url: `${SERVICE_URLS.USER}/api/users/refresh`,
              원본요청URL: originalRequest.url,
              원본요청메소드: originalRequest.method,
            });

            // 새로운 토큰을 받아오는 API 호출 (유저 서비스에서)
            const response = await axios.post(
              `${SERVICE_URLS.USER}/api/users/refresh`,
              {
                refresh_token: refreshToken,
              },
            );

            console.log('토큰 갱신 API 응답:', {
              status: response.status,
              dataStructure: response.data ? Object.keys(response.data) : null,
              hasData: !!response.data?.data,
              success: response.data?.success,
            });

            if (!response.data?.success || !response.data?.data) {
              console.error('토큰 갱신 응답 구조 오류:', response.data);
              throw new Error('Invalid refresh response structure');
            }

            const { access_token, refresh_token: newRefreshToken } =
              response.data.data;

            console.log('토큰 갱신 성공:', {
              hasAccessToken: !!access_token,
              hasRefreshToken: !!newRefreshToken,
              accessTokenLength: access_token?.length,
              refreshTokenLength: newRefreshToken?.length,
            });

            if (!access_token || !newRefreshToken) {
              console.error('토큰 갱신 응답에 토큰 없음:', { access_token: !!access_token, refresh_token: !!newRefreshToken });
              throw new Error('Missing tokens in refresh response');
            }

            // 새 토큰 유효성 검증
            try {
              const tokenParts = access_token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const now = new Date().getTime() / 1000;
                if (payload.exp && payload.exp < now) {
                  console.error('갱신된 토큰이 이미 만료됨:', { exp: payload.exp, now });
                  throw new Error('Refreshed token is already expired');
                }
                console.log('갱신된 토큰 검증 성공:', {
                  exp: payload.exp,
                  profile_id: payload.profile_id,
                  profile_type: payload.profile_type,
                });
              }
            } catch (validationError) {
              console.error('갱신된 토큰 유효성 검증 실패:', validationError);
              throw new Error('Invalid refreshed token');
            }

            // 토큰 저장
            await tokenStorage.setTokens(access_token, newRefreshToken);

            // 저장 검증
            const savedToken = await tokenStorage.getAccessToken();
            const savedRefresh = await tokenStorage.getRefreshToken();
            console.log('토큰 저장 검증:', {
              저장성공: !!savedToken && !!savedRefresh,
              저장된토큰길이: savedToken?.length,
              저장된리프레시길이: savedRefresh?.length,
            });

            // AuthProvider 상태 업데이트 (콜백이 설정된 경우)
            if (tokenRefreshCallback) {
              console.log('AuthProvider 토큰 갱신 콜백 호출');
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
            console.log('원래 요청 재시도:', { url: originalRequest.url, method: originalRequest.method });
            return client(originalRequest);
          } else {
            console.error('리프레시 토큰이 없음 - 자동 로그아웃 필요');
            throw new Error('No refresh token available');
          }
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', {
            error: refreshError,
            status: refreshError.response?.status,
            data: refreshError.response?.data,
            message: refreshError.message,
            url: `${SERVICE_URLS.USER}/api/users/refresh`,
          });

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
            console.log('AuthProvider 로그아웃 콜백 호출');
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
  console.log('handleApiResponse 처리:', {
    status: response.status,
    success: response.data?.success,
    message: response.data?.message,
    hasData: !!response.data?.data,
    dataType: typeof response.data?.data,
    dataLength: Array.isArray(response.data?.data) ? response.data.data.length : undefined,
  });

  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'API 호출 실패');
};
