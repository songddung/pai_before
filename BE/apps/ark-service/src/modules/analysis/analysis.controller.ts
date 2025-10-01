import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AnalysisService } from './analysis.service';
import type {
  CreateAnalysisDto,
  AnalysisQueryDto,
  AnalysisResponseDto,
  ApiResponse,
} from '@your-org/shared-types';

@Controller('api/ark/analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly jwtService: JwtService,
  ) {}

  // JWT에서 사용자 정보 추출하는 헬퍼 메서드
  private extractUserInfoFromJWT(authHeader: string): { profileId: string; profileType: string } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('유효한 토큰이 필요합니다.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const profileType = payload.profile_type || payload.profileType;
      const profileId = payload.profile_id || payload.profileId;

      if (!profileType || !profileId) {
        throw new UnauthorizedException('토큰에 프로필 정보가 없습니다.');
      }

      return {
        profileId: profileId.toString(),
        profileType,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 처리 중 오류가 발생했습니다.');
    }
  }

  @Post()
  async createAnalysis(
    @Body() data: CreateAnalysisDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<null>> {
    console.log('관심사 분석 생성 요청:', data);

    try {
      const userInfo = this.extractUserInfoFromJWT(authHeader);

      // 권한 검증: 부모와 아이 모두 분석 생성 가능 (아이는 대화 종료 시 자동 생성)
      if (userInfo.profileType !== 'PARENT' && userInfo.profileType !== 'CHILD') {
        throw new UnauthorizedException('올바르지 않은 프로필 타입입니다.');
      }

      await this.analysisService.createAnalysis(data);

      return {
        success: true,
        message: '관심사 분석이 생성되었습니다',
        data: null,
      };
    } catch (error) {
      console.error('관심사 분석 생성 실패:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.message.includes('찾을 수 없습니다')) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException('관심사 분석 생성에 실패했습니다.');
    }
  }

  @Get()
  async getAnalysis(
    @Query() query: AnalysisQueryDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<AnalysisResponseDto[]>> {
    console.log('관심사 분석 조회 요청:', query);

    // query 파라미터 검증 및 변환
    if (!query.child_id && (query as any).childId) {
      query.child_id = (query as any).childId;
    }

    if (!query.child_id) {
      throw new BadRequestException('child_id 파라미터가 필요합니다.');
    }

    // limit 파라미터 숫자 변환
    if (query.limit && typeof query.limit === 'string') {
      (query as any).limit = parseInt(query.limit);
    }

    try {
      const userInfo = this.extractUserInfoFromJWT(authHeader);

      // 권한 검증: 부모만 분석 조회 가능
      if (userInfo.profileType !== 'PARENT') {
        throw new UnauthorizedException('부모만 관심사 분석을 조회할 수 있습니다.');
      }

      const analyses = await this.analysisService.getAnalysis(query);

      return {
        success: true,
        message: '관심사 분석을 조회했습니다',
        data: analyses,
      };
    } catch (error) {
      console.error('관심사 분석 조회 실패:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.message.includes('찾을 수 없습니다')) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException('관심사 분석 조회에 실패했습니다.');
    }
  }
}