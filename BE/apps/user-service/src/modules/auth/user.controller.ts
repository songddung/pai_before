import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginResponse, UserResponse } from '@your-org/shared-types';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginDto } from '../../dto/login.dto';
import { ApiResponse } from '@your-org/shared-types';
import { JwtService } from '@nestjs/jwt';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입
  @Post()
  @HttpCode(201)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<UserResponse>> {
    const data = await this.userService.createUser(createUserDto);
    return {
      success: true,
      message: '회원가입이 완료되었습니다',
      data,
    };
  }

  // 로그인
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const data = await this.userService.login(loginDto);
    return {
      success: true,
      message: '로그인이 완료되었습니다.',
      data,
    };
  }

  // 로그아웃
  @Post('logout')
  @HttpCode(204)
  async logout(@Headers('authorization') auth: string): Promise<void> {
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    await this.userService.logout(token);
  }

  // 토큰 갱신
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refresh_token: string }): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
    const tokens = await this.userService.refreshTokens(body.refresh_token);
    return {
      success: true,
      message: '토큰이 갱신되었습니다.',
      data: tokens,
    };
  }

  // 아이 프로필의 사용자 좌표 조회 (ark-service에서 호출)
  @Get('child/:childId/coordinates')
  async getChildCoordinates(
    @Param('childId') childId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<{ latitude: number; longitude: number }>> {
    console.log('아이 좌표 조회 요청:', { childId });

    // JWT 토큰에서 사용자 정보 추출 (필요시)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('유효한 토큰이 필요합니다.');
    }

    const coordinates = await this.userService.getChildCoordinates(childId);
    return {
      success: true,
      message: '좌표 조회 완료',
      data: coordinates,
    };
  }
}
