import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { UserService } from '../../domains/user/service/userService';
import { tokenUtils } from '../../shared/utils/token';
import { profileApi } from '../../domains/user/api/userApi';
import { setTokenCallbacks, tokenStorage } from '../../shared/api/client';
import { useAuthStore } from '../../domains/user/models/user';
// 타입 정의 (shared-types 대신 로컬 정의)
interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

interface User {
  user_id?: string;
  userId?: string;
  email: string;
  name?: string;
  created_at?: string;
}

// AuthState 타입 정의
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (loginData: LoginRequest) => Promise<boolean>;
  signup: (signupData: SignupRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  selectProfile: (profileId: string, profileType: 'PARENT' | 'CHILD', pin?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 프로필 선택 중복 방지를 위한 플래그
  const [isProfileSelecting, setIsProfileSelecting] = useState(false);
  const isProfileSelectingRef = useRef(false);

  // zustand store 접근
  const { setSelectedProfile: setZustandSelectedProfile } = useAuthStore();

  // 앱 시작 시 저장된 인증 정보 확인 및 토큰 콜백 설정
  useEffect(() => {
    // 토큰 자동 갱신 콜백 설정
    setTokenCallbacks(
      // 토큰 갱신 성공 시 콜백
      (accessToken: string, refreshToken: string) => {
        console.log('AuthProvider: 토큰 자동 갱신됨', {
          accessTokenLength: accessToken.length,
          refreshTokenLength: refreshToken.length,
        });
        setAuthState(prev => ({
          ...prev,
          accessToken,
          refreshToken,
        }));
      },
      // 로그아웃 콜백
      () => {
        console.log('AuthProvider: 토큰 갱신 실패로 자동 로그아웃');
        // 프로필 선택 중이 아닌 경우에만 자동 로그아웃
        if (!isProfileSelectingRef.current) {
          console.log('AuthProvider: 자동 로그아웃 실행');
          setAuthState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else {
          console.log('AuthProvider: 프로필 선택 중이므로 자동 로그아웃 건너뜀');
        }
      }
    );

    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // UserService가 정의되어 있는지 확인
      if (!UserService || typeof UserService.getCurrentToken !== 'function') {
        console.warn('UserService not available, skipping auth check');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const accessToken = await UserService.getCurrentToken();

      if (accessToken) {
        // 저장된 사용자 정보 확인
        const storedUser = await SecureStore.getItemAsync('user_data');
        const refreshToken = await SecureStore.getItemAsync('refresh_token');

        if (storedUser) {
          const user = JSON.parse(storedUser);

          setAuthState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // 사용자 정보가 없으면 로그아웃 처리
          await UserService.logout();
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // 토큰은 있지만 사용자 정보 조회 실패 시 로그아웃 처리
      await UserService.logout();
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const login = async (loginData: LoginRequest): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // 로그인으로 토큰과 사용자 정보 받기
      const { accessToken, refreshToken, user } = await UserService.login(loginData);

      console.log('AuthProvider: 로그인 성공 후 토큰 상태:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length,
        user: user?.userId,
      });

      // 토큰에서 실제 userId 추출하여 사용자 정보 업데이트
      const userId = tokenUtils.getUserIdFromToken(accessToken);
      if (userId) {
        user.userId = userId;
      }

      // 사용자 정보도 저장
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      console.log('AuthProvider: 사용자 정보 저장 완료:', user.userId);

      setAuthState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return false;
    }
  };

  const signup = async (signupData: SignupRequest): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      await UserService.signup(signupData);

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await UserService.logout();
      await SecureStore.deleteItemAsync('user_data');

      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // 로그아웃은 실패해도 상태 초기화
      await SecureStore.deleteItemAsync('user_data');
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const selectProfile = async (profileId: string, profileType: 'PARENT' | 'CHILD', pin?: string): Promise<boolean> => {
    // 중복 프로필 선택 방지
    if (isProfileSelecting) {
      console.warn('AuthProvider: 이미 프로필 선택 중 - 요청 무시');
      return false;
    }

    // 현재 선택된 프로필과 동일한 경우 무시
    const currentToken = await tokenStorage.getAccessToken();
    if (currentToken) {
      const currentTokenData = tokenUtils.decodeToken(currentToken);
      if (currentTokenData?.profile_id?.toString() === profileId &&
          currentTokenData?.profile_type === profileType) {
        console.log('AuthProvider: 이미 동일한 프로필 선택됨 - 요청 무시');
        return true;
      }
    }

    try {
      setIsProfileSelecting(true);
      isProfileSelectingRef.current = true;

      if (!authState.accessToken) {
        console.error('AuthProvider: 액세스 토큰이 없음');
        throw new Error('No access token available');
      }

      console.log('AuthProvider: 프로필 선택 시작:', { profileId, profileType, hasPin: !!pin });

      // 현재 토큰 상태 로깅
      const currentToken = await tokenStorage.getAccessToken();
      const currentRefresh = await tokenStorage.getRefreshToken();
      console.log('AuthProvider: 프로필 선택 전 토큰 상태:', {
        hasCurrentToken: !!currentToken,
        hasCurrentRefresh: !!currentRefresh,
        currentTokenLength: currentToken?.length,
        refreshTokenLength: currentRefresh?.length,
      });

      const result = await profileApi.selectProfile(profileId, profileType, pin);
      console.log('AuthProvider: 프로필 선택 API 응답:', {
        hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        accessTokenLength: result.access_token?.length,
        refreshTokenLength: result.refresh_token?.length,
      });

      if (result.access_token && result.refresh_token) {
        // 토큰 유효성 검증
        try {
          const decodedToken = tokenUtils.decodeToken(result.access_token);
          console.log('AuthProvider: 새 토큰 유효성 검증:', {
            hasPayload: !!decodedToken,
            sub: decodedToken?.sub,
            profile_id: decodedToken?.profile_id,
            profile_type: decodedToken?.profile_type,
            profile_name: decodedToken?.profile_name,
            exp: decodedToken?.exp,
            현재시간: new Date().getTime() / 1000,
            만료여부: decodedToken?.exp ? (decodedToken.exp < (new Date().getTime() / 1000) ? '만료됨' : '유효함') : '확인불가',
          });

          // 토큰이 만료되었으면 에러
          if (decodedToken?.exp && decodedToken.exp < (new Date().getTime() / 1000)) {
            console.error('AuthProvider: 새로 받은 토큰이 이미 만료됨');
            throw new Error('Received expired token');
          }

          // 프로필 정보가 없으면 에러
          if (!decodedToken?.profile_id) {
            console.error('AuthProvider: 새 토큰에 프로필 정보 없음');
            throw new Error('Token missing profile information');
          }
        } catch (decodeError) {
          console.error('AuthProvider: 토큰 디코딩 실패:', decodeError);
          throw new Error('Invalid token format');
        }

        // 새로운 토큰 저장 (토큰 저장소와 상태 동시 업데이트)
        console.log('AuthProvider: 새로운 토큰 저장 시작');

        try {
          await UserService.saveTokens(result.access_token, result.refresh_token);

          // 저장 확인 (재시도 로직 포함)
          let saveRetryCount = 0;
          const maxSaveRetries = 3;
          let savedToken, savedRefresh;

          while (saveRetryCount < maxSaveRetries) {
            savedToken = await tokenStorage.getAccessToken();
            savedRefresh = await tokenStorage.getRefreshToken();

            if (savedToken && savedRefresh) {
              console.log('AuthProvider: 토큰 저장 확인 성공:', {
                토큰저장됨: !!savedToken,
                리프레시저장됨: !!savedRefresh,
                저장된토큰길이: savedToken?.length,
                저장된리프레시길이: savedRefresh?.length,
                saveRetryCount,
              });
              break;
            }

            console.warn(`AuthProvider: 토큰 저장 확인 실패 (${saveRetryCount + 1}/${maxSaveRetries}), 재시도 중...`);
            saveRetryCount++;

            if (saveRetryCount < maxSaveRetries) {
              // 재저장 시도
              await UserService.saveTokens(result.access_token, result.refresh_token);
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        } catch (saveError) {
          console.error('AuthProvider: 토큰 저장 오류:', saveError);
          // 토큰 저장 실패해도 계속 진행 (메모리상 상태는 업데이트)
        }

        // 상태 업데이트
        setAuthState(prev => ({
          ...prev,
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
        }));

        // zustand store에 선택된 프로필 정보 업데이트
        try {
          // 새로운 토큰에서 프로필 정보 추출
          const decodedNewToken = tokenUtils.decodeToken(result.access_token);
          console.log('AuthProvider: 새 토큰에서 프로필 정보 추출:', {
            profile_id: decodedNewToken?.profile_id,
            profile_name: decodedNewToken?.profile_name,
            profile_type: decodedNewToken?.profile_type,
          });

          // 프로필 상세 정보 조회 (profile_id와 profile_type 모두 확인)
          const allProfiles = await profileApi.getAllProfiles();
          const selectedProfileData = allProfiles.find(
            (profile) =>
              profile.profile_id.toString() === decodedNewToken?.profile_id?.toString() &&
              profile.profile_type === decodedNewToken?.profile_type
          );

          if (selectedProfileData) {
            console.log('AuthProvider: zustand store에 프로필 정보 업데이트:', selectedProfileData);
            setZustandSelectedProfile(selectedProfileData);
          } else {
            console.warn('AuthProvider: 선택된 프로필 정보를 찾을 수 없음');
          }
        } catch (profileError) {
          console.error('AuthProvider: 프로필 정보 업데이트 실패:', profileError);
        }

        console.log('AuthProvider: 프로필 선택 성공');

        // 토큰 업데이트 완료를 위한 지연 (안정화 시간 증가)
        await new Promise(resolve => setTimeout(resolve, 300));

        // 토큰 상태 최종 검증 (더 관대한 검증)
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          const finalAccessToken = await tokenStorage.getAccessToken();
          const finalRefreshToken = await tokenStorage.getRefreshToken();

          if (finalAccessToken && finalRefreshToken) {
            console.log('AuthProvider: 토큰 상태 최종 검증 완료:', {
              tokenLength: finalAccessToken.length,
              refreshLength: finalRefreshToken.length,
              retryCount,
            });
            return true;
          }

          console.warn(`AuthProvider: 토큰 상태 검증 실패 (${retryCount + 1}/${maxRetries}), 재시도 중...`);
          retryCount++;

          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        console.error('AuthProvider: 토큰 상태 검증 최종 실패');
        // 토큰 상태가 불일치해도 프로필 선택 자체는 성공으로 처리
        return true;
      }

      console.error('AuthProvider: 프로필 선택 응답에 토큰 없음');
      return false;
    } catch (error) {
      const errorObj = error as any;
      console.error('AuthProvider: 프로필 선택 실패:', {
        error: errorObj?.message || String(error),
        status: errorObj?.response?.status,
        data: errorObj?.response?.data,
      });

      // 401 오류인 경우 로그아웃 처리
      if (errorObj?.response?.status === 401) {
        console.log('AuthProvider: 401 오류로 인한 로그아웃 처리');
        await logout();
      }

      return false;
    } finally {
      setIsProfileSelecting(false);
      isProfileSelectingRef.current = false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        selectProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};