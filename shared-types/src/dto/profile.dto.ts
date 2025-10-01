export interface CreateProfileDto {
  user_id: string;
  profile_type: 'PARENT' | 'CHILD';
  name: string;
  birth_date: string;
  gender: 'MALE' | 'FEMALE';
  avatar_media_id: string;
  pin?: string;
}

export interface ProfileResponse {
  profile_id: number;
  user_id: string;
  profile_type: 'PARENT' | 'CHILD';
  name: string;
  birth_date: string;
  gender: 'MALE' | 'FEMALE';
  avatar_media_id?: string;
  voice_media_id?: string;
  created_at: string;
}

export interface UpdateProfileDto {
  name?: string;
  birth_date?: string;
  gender?: 'MALE' | 'FEMALE';
  avatar_media_id?: string;
  voice_media_id?: string;
  pin?: string;
}

export interface SelectProfileDto {
  profile_type: 'PARENT' | 'CHILD';
}

export interface PinDto {
  pin: string;
}
