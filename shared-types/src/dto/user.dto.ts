// 회원가입 요청
export interface CreateUserDto {
  email: string;
  password: string;
  address: string;
}

// 로그인 요청
export interface LoginDto {
  email: string;
  password: string;
}


export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateChildRequest {
  userId: string;
  name: string;
  birthDate: string;
}
