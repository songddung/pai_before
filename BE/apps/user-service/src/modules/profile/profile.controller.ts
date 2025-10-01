import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from 'src/dto/create-profile.dto';
import { ApiResponse } from '@your-org/shared-types';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';

@Controller('api/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
  ) {}

  // JWT에서 사용자 정보 추출하는 헬퍼 메서드
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

      // auth-service에서 사용하는 필드명 확인 (sub 우선)
      const userId =
        payload.sub || payload.user_id || payload.userId || payload.id;
      if (!userId) {
        throw new UnauthorizedException(
          '토큰에서 사용자 ID를 찾을 수 없습니다.',
        );
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

  // 프로필 등록
  @Post()
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<ApiResponse<any>> {
    let userId = '1';
    try {
      if (authHeader) {
        const userInfo = this.extractUserInfoFromJWT(authHeader);
        userId = userInfo.userId;
      }
    } catch (error) {
      // JWT 없으면 임시 사용자 ID 사용
      console.log('JWT 인증 실패, 임시 사용자 ID 사용:', error.message);
    }
    createProfileDto.user_id = userId;
    const profile = await this.profileService.createProfile(createProfileDto);
    return {
      success: true,
      message: '프로필 생성 성공',
      data: profile,
    };
  }

  // 프로필 전체 조회
  @Get()
  async getAllProfiles(
    @Headers('authorization') authHeader?: string,
  ): Promise<ApiResponse<any>> {
    // 임시로 JWT 인증 건너뛰기 (테스트용)
    let userId = '1';
    try {
      if (authHeader) {
        const userInfo = this.extractUserInfoFromJWT(authHeader);
        userId = userInfo.userId;
      }
    } catch (error) {
      // JWT 없으면 임시 사용자 ID 사용
      console.log('JWT 인증 실패, 임시 사용자 ID 사용:', error.message);
    }
    const profiles = await this.profileService.getAllProfiles(userId);
    return {
      success: true,
      message: '모든 프로필 조회 성공',
      data: profiles,
    };
  }

  // 프로필 수정
  @Patch('/:profileId')
  async updateProfile(
    @Param('profileId') profileId: string,
    @Headers('authorization') authHeader: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponse<any>> {
    const { userId, profileType } = this.extractUserInfoFromJWT(authHeader);

    if (!profileType) {
      throw new BadRequestException('프로필이 선택되지 않았습니다');
    }

    const updateProfile = await this.profileService.updateProfile(
      profileId,
      profileType as 'PARENT' | 'CHILD',
      userId,
      updateProfileDto,
    );
    return {
      success: true,
      message: '프로필 수정 성공',
      data: updateProfile,
    };
  }

  // 프로필 삭제
  @Delete('/:profileId')
  @HttpCode(200)
  async deleteProfile(
    @Param('profileId') profileId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<any>> {
    const { userId, profileType } = this.extractUserInfoFromJWT(authHeader);

    if (!profileType) {
      throw new BadRequestException('프로필이 선택되지 않았습니다');
    }

    await this.profileService.deleteProfile(
      profileId,
      userId,
      profileType as 'PARENT' | 'CHILD',
    );
    return {
      success: true,
      message: '프로필 삭제 성공',
      data: null,
    };
  }

  // 프로필 선택
  @Post('/:profileId/select')
  async selectProfile(
    @Param('profileId') profileId: string,
    @Body() body: { profile_type: 'PARENT' | 'CHILD'; pin?: string },
    @Headers('authorization') authHeader?: string,
  ): Promise<ApiResponse<any>> {
    // 임시로 JWT 인증 건너뛰기 (테스트용)
    let userId = '1';
    try {
      if (authHeader) {
        const userInfo = this.extractUserInfoFromJWT(authHeader);
        userId = userInfo.userId;
      }
    } catch (error) {
      // JWT 없으면 임시 사용자 ID 사용
      console.log('JWT 인증 실패, 임시 사용자 ID 사용:', error.message);
    }

    console.log('프로필 선택 요청:', {
      profileId,
      userId,
      profileType: body.profile_type,
      hasPin: !!body.pin
    });

    // 부모 프로필 선택 시 PIN 검증 필요
    if (body.profile_type === 'PARENT') {
      if (!body.pin) {
        throw new BadRequestException('부모 프로필 선택 시 PIN이 필요합니다');
      }

      // PIN 검증
      const isPinValid = await this.profileService.verifyPin(profileId, userId, body.pin);
      if (!isPinValid) {
        throw new BadRequestException('PIN이 일치하지 않습니다');
      }
      console.log('PIN 검증 성공');
    }

    const result = await this.profileService.selectProfile(
      profileId,
      userId,
      body.profile_type,
    );
    return {
      success: true,
      message: '프로필 선택 성공',
      data: result,
    };
  }

  // PIN 설정(부모 프로필 전용)
  @Patch('/:profileId/pin')
  @HttpCode(200)
  async updatePin(
    @Param('profileId') profileId: string,
    @Headers('authorization') authHeader: string,
    @Body() body: { pin: string },
  ): Promise<ApiResponse<any>> {
    const { userId, profileType } = this.extractUserInfoFromJWT(authHeader);

    if (profileType !== 'PARENT') {
      throw new BadRequestException('PIN은 부모 프로필만 설정할 수 있습니다.');
    }

    await this.profileService.updatePin(profileId, userId, body.pin);
    return {
      success: true,
      message: 'PIN 설정 성공',
      data: null,
    };
  }

  // PIN 검증
  @Post('/:profileId/pin/verify')
  async verify(
    @Param('profileId') profileId: string,
    @Headers('authorization') authHeader: string,
    @Body() body: { pin: string },
  ): Promise<ApiResponse<any>> {
    const { userId, profileType } = this.extractUserInfoFromJWT(authHeader);

    if (profileType !== 'PARENT') {
      throw new BadRequestException('PIN 검증은 부모 프로필만 가능합니다');
    }

    const isValid = await this.profileService.verifyPin(
      profileId,
      userId,
      body.pin,
    );
    return {
      success: true,
      message: 'PIN 검증 완료',
      data: { valid: isValid },
    };
  }

  // 음성 등록 (부모 프로필 전용)
  @Post('/:profileId/voice')
  @UseInterceptors(FileInterceptor('audio_file'))
  async registerVoice(
    @Param('profileId') profileId: string,
    @Headers('authorization') authHeader: string,
    @UploadedFile() audioFile: any,
  ): Promise<ApiResponse<any>> {
    const { userId, profileType } = this.extractUserInfoFromJWT(authHeader);

    if (profileType !== 'PARENT') {
      throw new BadRequestException('음성 등록은 부모 프로필만 가능합니다');
    }

    if (!audioFile) {
      throw new BadRequestException('음성 파일이 업로드되지 않았습니다');
    }

    const result = await this.profileService.registerVoice(
      profileId,
      userId,
      audioFile,
      authHeader,
    );

    return {
      success: true,
      message: '음성 등록 성공',
      data: result,
    };
  }
}
