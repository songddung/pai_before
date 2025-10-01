export interface UserResponse {
  userId: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface ParentResponse {
  parentId: string;
  userId: string;
  name: string;
  birthDate: string;
  gender: string;
  avatarMediaId: string;
  voiceMediaId: string;
  createdAt: string;
}

export interface ChildResponse {
  childId: string;
  userId: string;
  birthDate: string;
  gender: string;
  avatarMediaId: string;
  createdAt: string;
}

//회원가입 응답
export interface RegisterResponse {
  user: UserResponse;
}
