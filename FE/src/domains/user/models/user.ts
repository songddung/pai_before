import { create } from 'zustand';
import { tokenStorage } from '../../../shared/api/client';

// 타입 정의
export interface UserResponse {
  user_id: string;
  email: string;
  name?: string;
  created_at: string;
}

// shared-types와 호환되는 ProfileResponse 정의
export interface ProfileResponse {
  profile_id: number;
  user_id: string;
  profile_type: 'PARENT' | 'CHILD';
  name: string;
  birth_date?: string;
  gender?: 'MALE' | 'FEMALE';
  avatar_media_id?: string;
  voice_media_id?: string;
  created_at: string;

  // 호환성을 위한 alias 필드들
  profile_name?: string; // name의 alias로 사용 (JWT 토큰에서 사용)
}

interface AuthState {
  user: UserResponse | null;
  selectedProfile: ProfileResponse | null;
  profiles: ProfileResponse[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: UserResponse | null) => void;
  setSelectedProfile: (profile: ProfileResponse | null) => void;
  setProfiles: (profiles: ProfileResponse[]) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  login: (
    user: UserResponse,
    tokens: { access_token: string; refresh_token: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
  selectProfile: (
    profile: ProfileResponse,
    tokens: { access_token: string; refresh_token: string },
  ) => Promise<void>;
  addProfile: (profile: ProfileResponse) => void;
  updateProfile: (
    profileId: number,
    updatedProfile: Partial<ProfileResponse>,
  ) => void;
  removeProfile: (profileId: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  selectedProfile: null,
  profiles: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setSelectedProfile: (selectedProfile) => set({ selectedProfile }),
  setProfiles: (profiles) => set({ profiles }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (user, tokens) => {
    await tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    set({
      user,
      isAuthenticated: true,
      error: null,
    });
  },

  logout: async () => {
    await tokenStorage.clearTokens();
    set({
      user: null,
      selectedProfile: null,
      profiles: [],
      isAuthenticated: false,
      error: null,
    });
  },

  selectProfile: async (profile, tokens) => {
    await tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    set({
      selectedProfile: profile,
      error: null,
    });
  },

  addProfile: (profile) => {
    const { profiles } = get();
    set({ profiles: [...profiles, profile] });
  },

  updateProfile: (profileId, updatedProfile) => {
    const { profiles, selectedProfile } = get();
    const updatedProfiles = profiles.map((profile) =>
      profile.profile_id === profileId
        ? { ...profile, ...updatedProfile }
        : profile,
    );

    const updatedSelectedProfile =
      selectedProfile?.profile_id === profileId
        ? { ...selectedProfile, ...updatedProfile }
        : selectedProfile;

    set({
      profiles: updatedProfiles,
      selectedProfile: updatedSelectedProfile as ProfileResponse | null,
    });
  },

  removeProfile: (profileId) => {
    const { profiles, selectedProfile } = get();
    const filteredProfiles = profiles.filter(
      (profile) => profile.profile_id !== profileId,
    );
    const newSelectedProfile =
      selectedProfile?.profile_id === profileId ? null : selectedProfile;

    set({
      profiles: filteredProfiles,
      selectedProfile: newSelectedProfile,
    });
  },
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useSelectedProfile = () =>
  useAuthStore((state) => state.selectedProfile);
export const useProfiles = () => useAuthStore((state) => state.profiles);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
