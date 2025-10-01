import {
  Controller,
  Get,
  Query,
  Headers,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReportService } from './report.service';
import type {
  GetReportQueryDto,
  ReportResponseDto,
  ApiResponse,
} from '@your-org/shared-types';

@Controller('api/ark/reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
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

  @Get()
  async getReport(
    @Query() query: GetReportQueryDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<ReportResponseDto>> {
    console.log('리포트 조회 요청:', query);

    try {
      const userInfo = this.extractUserInfoFromJWT(authHeader);

      // 권한 검증: 부모만 리포트 조회 가능
      if (userInfo.profileType !== 'PARENT') {
        throw new UnauthorizedException('부모만 리포트를 조회할 수 있습니다.');
      }

      const report = await this.reportService.getReport(query);

      return {
        success: true,
        message: '리포트를 조회했습니다',
        data: report,
      };
    } catch (error) {
      console.error('리포트 조회 실패:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.message.includes('찾을 수 없습니다')) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException('리포트 조회에 실패했습니다.');
    }
  }
}