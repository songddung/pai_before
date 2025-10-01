import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException, BadRequestException, InternalServerErrorException, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConversationService } from './conversation.service';
import type { StartConversationDto, ApiResponse } from '@your-org/shared-types';

@Controller('api/conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
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

      // 프로필 정보 추출 (child든 parent든 모두 허용)
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

  @Post('start')
  async startConversation(
    @Body() data: StartConversationDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<{ conversationId: string }>> {
    console.log('Received data:', data);
    console.log('Auth header:', authHeader);

    const userInfo = this.extractUserInfoFromJWT(authHeader);

    // 임시 세션 ID 생성 (Redis용)
    const conversationId = Date.now().toString();

    try {
      await this.conversationService.startConversation(conversationId, {
        childId: userInfo.profileId,
        title: data.title,
        initialImageS3Url: data.initialImageS3Url,
        questions: data.questions,
      });

      return {
        success: true,
        message: '대화가 시작되었습니다',
        data: { conversationId },
      };
    } catch (error) {
      throw new InternalServerErrorException('대화 시작에 실패했습니다');
    }
  }

  @Post(':conversationId/end')
  async endConversation(
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<null>> {
    try {
      const userInfo = this.extractUserInfoFromJWT(authHeader);

      // 임시 해결책: 토큰의 profile_type이 잘못되어 있으므로 토큰에서 직접 확인
      const token = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.decode(token) as any;
      const actualProfileType = payload.profile_type === 'CHILD' ? 'CHILD' : userInfo.profileType;

      console.log('토큰 profile_type 확인:', {
        tokenProfileType: payload.profile_type,
        extractedProfileType: userInfo.profileType,
        finalProfileType: actualProfileType
      });

      const result = await this.conversationService.endConversation(conversationId, actualProfileType, authHeader);

      return {
        success: true,
        message: result.isChild
          ? '대화가 종료되고 데이터베이스에 저장되었습니다'
          : '대화가 종료되었습니다 (임시 세션 삭제)',
        data: null,
      };
    } catch (error) {
      if (error.message.includes('찾을 수 없습니다')) {
        throw new BadRequestException(error.message);
      } else if (error.message.includes('타입')) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException('대화 종료에 실패했습니다');
      }
    }
  }

  @Get('images')
  async getConversationImages(
    @Headers('authorization') authHeader: string,
    @Query('childId') childId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<any>> {
    const userInfo = this.extractUserInfoFromJWT(authHeader);

    if (!childId) {
      throw new BadRequestException('childId는 필수입니다');
    }

    try {
      const pageNum = page ? Math.max(parseInt(page), 1) : 1;
      const limitNum = limit ? Math.min(parseInt(limit), 100) : 30;
      const result = await this.conversationService.getConversationImages(childId, pageNum, limitNum);

      return {
        success: true,
        message: '대화 이미지 목록 조회 성공',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException('이미지 목록 조회에 실패했습니다');
    }
  }

  @Get(':conversationId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<any>> {
    const userInfo = this.extractUserInfoFromJWT(authHeader);

    try {
      const conversation = await this.conversationService.getConversationDetail(conversationId);
      return {
        success: true,
        message: '대화 조회 성공',
        data: conversation,
      };
    } catch (error) {
      if (error.message.includes('찾을 수 없습니다')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('대화 조회에 실패했습니다');
    }
  }

  @Get(':conversationId/redis-data')
  async getConversationFromRedis(@Param('conversationId') conversationId: string) {
    return await this.conversationService.getRedisData(conversationId);
  }
}