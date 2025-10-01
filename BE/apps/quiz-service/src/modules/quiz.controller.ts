import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Headers,
  HttpCode,
  UnauthorizedException,
  ConflictException,
  Param,
  } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from 'src/dto/create-quiz.dto';
import { UpdateQuizDto } from 'src/dto/update-quiz.dto';
import { SubmitQuizDto } from 'src/dto/submit-quiz.dto';
import { QuizResponse, AvailableQuizResponse, QuizSubmitResponse, AllChildrenQuizzesResponse } from '@your-org/shared-types';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '@your-org/shared-types';

@Controller('api/quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly jwtService: JwtService,
  ) {}

  // JWT에서 사용자 정보 추출
  private extractUserInfoFromJWT(authHeader: string): {
    userId: string;
    profileId?: string;
    profileType?: string;
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

      const userId = payload.sub;
      if (!userId) {
        throw new UnauthorizedException('토큰에서 사용자 ID를 찾을 수 없습니다.');
      }

      return {
        userId: userId.toString(),
        profileId: (payload.profile_id || payload.profileId)?.toString(),
        profileType: payload.profile_type || payload.profileType,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 처리 중 오류가 발생했습니다.');
    }
  }

  // 부모 전용 퀴즈 생성
  @Post()
  @HttpCode(201)
  async CreateQuiz(
    @Headers('authorization') authHeader: string,
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<ApiResponse<QuizResponse>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 부모만 퀴즈 생성 가능
    if (profileType !== 'PARENT') {
      throw new UnauthorizedException('부모만 퀴즈를 생성할 수 있습니다.');
    }

    try {
      const data = await this.quizService.createQuiz(profileId, createQuizDto);
      return {
        success: true,
        message: '퀴즈가 성공적으로 생성되었습니다.',
        data,
      };
    } catch (error) {
      if (error.message === 'DUPLICATE_QUIZ_TODAY') {
        throw new ConflictException('오늘 이미 퀴즈를 생성하셨습니다.');
      }
      throw error;
    }
  }

  // 부모 전용 퀴즈 수정
  @Patch(':id')
  @HttpCode(200)
  async updateQuiz(
    @Param('id') quizId: string,
    @Headers('authorization') authHeader: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<ApiResponse<QuizResponse>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 부모만 퀴즈 수정 가능
    if (profileType !== 'PARENT') {
      throw new UnauthorizedException('부모만 퀴즈를 수정할 수 있습니다.');
    }

    try {
      const data = await this.quizService.updateQuiz(quizId, profileId, updateQuizDto);
      return {
        success: true,
        message: '퀴즈가 성공적으로 수정되었습니다.',
        data,
      };
    } catch (error) {
      if (error.message === 'QUIZ_NOT_FOUND') {
        throw new UnauthorizedException('퀴즈를 찾을 수 없거나 수정 권한이 없습니다.');
      }
      if (error.message === 'QUIZ_NOT_EDITABLE_DATE') {
        throw new ConflictException('오늘 생성한 퀴즈만 수정할 수 있습니다.');
      }
      if (error.message === 'QUIZ_ALREADY_ATTEMPTED') {
        throw new ConflictException('이미 누군가 시도한 퀴즈는 수정할 수 없습니다.');
      }
      throw error;
    }
  }

  // 부모 전용 퀴즈 삭제
  @Delete(':id')
  @HttpCode(200)
  async deleteQuiz(
    @Param('id') quizId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<null>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 부모만 퀴즈 삭제 가능
    if (profileType !== 'PARENT') {
      throw new UnauthorizedException('부모만 퀴즈를 삭제할 수 있습니다.');
    }

    try {
      await this.quizService.deleteQuiz(quizId, profileId);
      return {
        success: true,
        message: '퀴즈가 삭제되었습니다.',
        data: null,
      };
    } catch (error) {
      if (error.message === 'QUIZ_NOT_FOUND') {
        throw new UnauthorizedException('퀴즈를 찾을 수 없거나 삭제 권한이 없습니다.');
      }
      throw error;
    }
  }

  // 아이 전용 오늘 퀴즈 목록 조회
  @Get('available')
  @HttpCode(200)
  async getAvailableQuizzes(
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<AvailableQuizResponse[]>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 아이만 퀴즈 목록 조회 가능
    if (profileType !== 'CHILD') {
      throw new UnauthorizedException('아이만 퀴즈 목록을 조회할 수 있습니다.');
    }

    try {
      const data = await this.quizService.getAvailableQuizzes(profileId, authHeader);
      return {
        success: true,
        message: '오늘의 퀴즈 목록을 조회했습니다.',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // 아이 전용 퀴즈 제출
  @Post(':id/submit')
  @HttpCode(200)
  async submitQuiz(
    @Param('id') quizId: string,
    @Headers('authorization') authHeader: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ): Promise<ApiResponse<QuizSubmitResponse>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 아이만 퀴즈 제출 가능
    if (profileType !== 'CHILD') {
      throw new UnauthorizedException('아이만 퀴즈를 제출할 수 있습니다.');
    }

    try {
      const data = await this.quizService.submitQuiz(quizId, profileId, submitQuizDto);
      return {
        success: true,
        message: '퀴즈 제출이 완료되었습니다.',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // 부모 전용 모든 자녀의 오늘 퀴즈 결과 조회
  @Get('children/completed')
  @HttpCode(200)
  async getAllChildrenQuizzes(
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<AllChildrenQuizzesResponse[]>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 부모만 조회 가능
    if (profileType !== 'PARENT') {
      throw new UnauthorizedException('부모만 자녀 퀴즈 결과를 조회할 수 있습니다.');
    }

    try {
      const data = await this.quizService.getAllChildrenQuizzes(profileId, authHeader);
      return {
        success: true,
        message: '자녀들의 오늘 퀴즈 결과를 조회했습니다.',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // 부모 전용 보상 지급 처리
  @Patch(':quizResultId/reward')
  @HttpCode(200)
  async giveReward(
    @Param('quizResultId') quizResultId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<{ rewardGiven: boolean }>> {
    // JWT에서 사용자 정보 추출
    const { userId, profileId, profileType } = this.extractUserInfoFromJWT(authHeader);

    // 프로필이 선택되어 있어야 함
    if (!profileId || !profileType) {
      throw new UnauthorizedException('프로필을 선택해주세요.');
    }

    // 부모만 보상 지급 가능
    if (profileType !== 'PARENT') {
      throw new UnauthorizedException('부모만 보상을 지급할 수 있습니다.');
    }

    try {
      const data = await this.quizService.giveReward(quizResultId, profileId);
      return {
        success: true,
        message: '보상이 지급되었습니다.',
        data,
      };
    } catch (error) {
      throw error;
    }
  }
}