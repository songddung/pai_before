import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Query,
  HttpCode,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { MediaService } from './media.service';
import {
  CreateMediaDto,
  MediaResponse,
  UploaderType,
  ApiResponse,
} from '@your-org/shared-types';

@Controller('/api/media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
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
      const userId = payload.sub || payload.user_id || payload.userId || payload.id;
      if (!userId) {
        throw new UnauthorizedException('토큰에서 사용자 ID를 찾을 수 없습니다.');
      }

      return {
        userId: userId.toString(),
        profileId: payload.profile_id?.toString(),
        profileType: payload.profile_type,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 처리 중 오류가 발생했습니다.');
    }
  }

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() createMediaDto: CreateMediaDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<MediaResponse>> {
    if (!file) {
      throw new Error('파일이 업로드되지 않았습니다');
    }

    const { userId } = this.extractUserInfoFromJWT(authHeader);

    // 프론트엔드에서 전송한 uploader_id가 JWT의 userId와 일치하는지 확인
    if (createMediaDto.uploader_id.toString() !== userId) {
      throw new UnauthorizedException('업로더 ID가 일치하지 않습니다');
    }

    const data = await this.mediaService.uploadFile(file, createMediaDto);
    return {
      success: true,
      message: '파일이 성공적으로 업로드되었습니다',
      data,
    };
  }

  @Get(':id')
  @HttpCode(200)
  async getMediaById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<MediaResponse>> {
    const data = await this.mediaService.getMediaById(id);
    return {
      success: true,
      message: '미디어 조회 성공',
      data,
    };
  }

  @Get('user/:uploaderProfileId')
  @HttpCode(200)
  async getMediaByUploader(
    @Param('uploaderProfileId', ParseIntPipe) uploaderProfileId: number,
    @Query('uploaderType') uploaderType: UploaderType,
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponse<MediaResponse[]>> {
    const { userId } = this.extractUserInfoFromJWT(authHeader);

    const data = await this.mediaService.getMediaByUploader(
      uploaderProfileId,
      uploaderType,
    );
    return {
      success: true,
      message: '사용자 미디어 목록 조회 성공',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteMedia(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const { userId } = this.extractUserInfoFromJWT(authHeader);
    await this.mediaService.deleteMedia(id);
  }
}
