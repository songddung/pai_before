export interface CreateUserDto {
    email: string;
    password: string;
    address: string;
}
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
