import {
  Controller,
  Headers,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Get,
  Query,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RecommendationService } from './recommendation.service';

@Controller('api/ark/recommend')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly jwtService: JwtService,
  ) {}

  // JWT에서 사용자 정보 추출하는 헬퍼 메서드
  private extractUserInfoFromJWT(authHeader: string): {
    profileId: string;
    profileType: string;
  } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('유효한 토큰이 필요합니다.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      console.log('JWT 토큰 페이로드 디버깅:', {
        sub: payload.sub,
        profile_id: payload.profile_id,
        profileId: payload.profileId,
        profile_type: payload.profile_type,
        profileType: payload.profileType,
        profile_name: payload.profile_name,
        exp: payload.exp,
        iat: payload.iat,
        allKeys: Object.keys(payload),
      });

      const profileType = payload.profile_type || payload.profileType;
      const profileId = payload.profile_id || payload.profileId;

      console.log('추출된 프로필 정보:', { profileType, profileId });

      if (!profileType || !profileId) {
        console.error('프로필 정보 누락:', {
          profileType,
          profileId,
          payload: payload,
        });
        throw new UnauthorizedException('토큰에 프로필 정보가 없습니다.');
      }

      return {
        profileId: profileId.toString(),
        profileType,
      };
    } catch (error) {
      console.error('토큰 처리 오류:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 처리 중 오류가 발생했습니다.');
    }
  }

  @Get()
  async getChildInterests(
    @Query('child_id') childId: string,
    @Query() allParams: any,
    @Headers('authorization') authHeader: string,
  ) {
    console.log('아이 관심사 조회 요청:', { childId, allParams });

    // child_id 파라미터 변환 처리 (camelCase -> snake_case)
    if (!childId && allParams.childId) {
      childId = allParams.childId;
    }

    try {
      const userInfo = this.extractUserInfoFromJWT(authHeader);

      // 권한 검증: 부모만 조회 가능
      if (userInfo.profileType !== 'PARENT') {
        throw new UnauthorizedException('부모만 관심사를 조회할 수 있습니다.');
      }

      if (!childId) {
        throw new BadRequestException('child_id는 필수입니다.');
      }

      const interests =
        await this.recommendationService.getRecommendations(childId, authHeader);

      return {
        success: true,
        message: '아이 관심사를 조회했습니다.',
        data: interests,
      };
    } catch (error) {
      console.error('관심사 조회 실패:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('관심사 조회에 실패했습니다.');
    }
  }
}
