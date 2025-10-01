import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import {
  UserResponse,
  CreateUserDto as ICreateUserDto,
  LoginResponse,
} from '@your-org/shared-types';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { LoginDto } from '../../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async createUser(createUserDto: ICreateUserDto): Promise<UserResponse> {
    const { email, password, address } = createUserDto;

    //이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이메일 중복됌');
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 12);

    // 주소를 위도 경도로 변경
    const { latitude, longitude } =
      await this.getCoordinatesFromAddress(address);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        address,
        latitude,
        longitude,
      },
      select: {
        userId: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    return {
      userId: user.userId.toString(),
      email: user.email,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // 로그인
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordvalid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordvalid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const payload = { sub: user.userId.toString() };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    await this.redisService.setRefreshToken(
      user.userId.toString(),
      refreshToken,
      30 * 24 * 60 * 60,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // 로그아웃
  async logout(accessToken: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(accessToken) as any;
      const userId = decoded.sub;

      const existingToken = await this.redisService.getRefreshToken(userId);
      if (!existingToken) {
        throw new UnauthorizedException('이미 로그아웃된 사용자입니다.');
      }
      await this.redisService.deleteRefreshToken(userId);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('만료된 토큰입니다');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다');
      } else if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }

  // 토큰 갱신
  async refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken) as any;
      const userId = decoded.sub;

      // Redis에서 리프레시 토큰 확인
      const storedToken = await this.redisService.getRefreshToken(userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 새로운 토큰 생성
      const payload = { sub: userId };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      });

      // 새로운 리프레시 토큰을 Redis에 저장
      await this.redisService.setRefreshToken(
        userId,
        newRefreshToken,
        30 * 24 * 60 * 60,
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('만료된 리프레시 토큰입니다');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      } else if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 갱신에 실패했습니다');
    }
  }

  // 아이 프로필의 사용자 좌표 조회 (childId를 통해 해당 사용자의 좌표 반환)
  async getChildCoordinates(childId: string): Promise<{ latitude: number; longitude: number }> {
    console.log('아이 좌표 조회 중:', { childId });

    // 1. Profile 테이블에서 childId로 해당 프로필의 user_id 조회
    const profile = await this.prisma.profile.findUnique({
      where: {
        profileId: BigInt(childId),
      },
      select: {
        userId: true,
        profileType: true,
      },
    });

    if (!profile) {
      throw new UnauthorizedException(`프로필 ID ${childId}를 찾을 수 없습니다.`);
    }

    if (profile.profileType !== 'CHILD') {
      throw new UnauthorizedException('아이 프로필만 조회할 수 있습니다.');
    }

    // 2. User 테이블에서 해당 사용자의 좌표 조회
    const user = await this.prisma.user.findUnique({
      where: {
        userId: profile.userId,
      },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    console.log('좌표 조회 완료:', { latitude: user.latitude, longitude: user.longitude });

    return {
      latitude: user.latitude,
      longitude: user.longitude,
    };
  }

  // 위도 경도 추출 함수
  private async getCoordinatesFromAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
  }> {
    try {
      // console.log('=== 주소 변환 시도 ===');
      // console.log('검색 주소:', address);
      // console.log('API 키 존재:', !!process.env.KAKAO_API_KEY);

      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
          },
        },
      );

      // console.log('API 응답 상태:', response.status);
      // console.log('API 응답 데이터:', JSON.stringify(response.data, null, 2));
      // console.log('문서 개수:', (response.data as any).documents?.length || 0);

      if ((response.data as any).documents.length > 0) {
        const { x, y } = (response.data as any).documents[0];
        console.log('변환 성공 - x:', x, 'y:', y);
        return {
          latitude: parseFloat(y),
          longitude: parseFloat(x),
        };
      }

      console.log('주소를 찾을 수 없음');
      return { latitude: 0, longitude: 0 };
    } catch (error) {
      console.error('=== 주소 변환 에러 ===');
      console.error('에러 메시지:', error.message);
      if (error.response) {
        console.error('HTTP 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
      return { latitude: 0, longitude: 0 };
    }
  }
}
