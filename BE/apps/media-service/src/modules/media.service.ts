import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '../services/s3.service';
import { PrismaService } from '../services/prisma.service';
import {
  CreateMediaDto,
  MediaResponse,
  UploaderType,
} from '@your-org/shared-types';

/**
 * 미디어 파일 관리를 위한 비즈니스 로직 서비스
 *
 * 주요 기능:
 * - 파일 업로드: S3 저장 + DB 메타데이터 저장
 * - 파일 조회: ID 또는 업로더별 조회
 * - 파일 삭제: S3와 DB에서 동시 삭제
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly s3Service: S3Service, // AWS S3 파일 저장 서비스
    private readonly prisma: PrismaService, // 데이터베이스 접근 서비스
  ) {}

  /**
   * 파일 업로드 처리
   *
   * 동작 순서:
   * 1. 파일을 S3에 업로드 (고유한 키로 저장)
   * 2. 파일 메타데이터를 데이터베이스에 저장
   * 3. 업로드 결과 정보 반환 (CDN URL 포함)
   *
   * @param file - 업로드된 파일 객체 (multer에서 처리)
   * @param createMediaDto - 업로더 정보 (ID, 타입)
   * @returns MediaEntity - 저장된 미디어 파일 정보
   */
  async uploadFile(
    file: any,
    createMediaDto: CreateMediaDto,
  ): Promise<MediaResponse> {
    this.logger.log('업로드 파일 처리 시작', { fileName: file.originalname });

    // 1단계: S3에 파일 업로드 (UUID로 고유한 파일명 생성)
    const uploadResult = await this.s3Service.uploadFile(
      file,
      Number(createMediaDto.uploader_id),
    );

    // 2단계: 데이터베이스에 미디어 파일 메타데이터 저장
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        uploaderProfileId: BigInt(createMediaDto.uploader_id),
        uploaderType: createMediaDto.uploader_type.toUpperCase() as
          | 'PARENT'
          | 'CHILD',
        fileName: file.originalname, // 원본 파일명
        mimeType: file.mimetype, // 파일 타입 (image/jpeg, video/mp4 등)
        fileSize: BigInt(file.size), // 파일 크기 (바이트)
        s3Key: uploadResult.s3Key, // S3에서의 파일 경로
        cdnUrl: uploadResult.cdnUrl, // 접근 가능한 CDN URL
      },
    });

    // 3단계: DB의 BigInt를 일반 number로 변환해서 반환
    return {
      media_id: Number(mediaFile.mediaId),
      uploader_profile_id: Number(mediaFile.uploaderProfileId),
      uploader_type: mediaFile.uploaderType.toLowerCase() as 'parent' | 'child',
      file_name: mediaFile.fileName,
      mime_type: mediaFile.mimeType,
      file_size: Number(mediaFile.fileSize),
      s3_key: mediaFile.s3Key,
      cdn_url: mediaFile.cdnUrl || '',
      created_at: mediaFile.createdAt,
    };
  }

  /**
   * 미디어 파일 ID로 조회
   *
   * @param mediaId - 조회할 미디어 파일의 고유 ID
   * @returns MediaEntity - 미디어 파일 정보
   * @throws Error - 파일을 찾을 수 없는 경우
   */
  async getMediaById(mediaId: number): Promise<MediaResponse> {
    this.logger.log('미디어 조회', { mediaId });

    // 데이터베이스에서 미디어 파일 검색
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { mediaId: BigInt(mediaId) },
    });

    // 파일이 존재하지 않으면 에러 발생
    if (!mediaFile) {
      throw new Error(`미디어 파일을 찾을 수 없습니다: ${mediaId}`);
    }

    // DB 데이터를 클라이언트 형식으로 변환해서 반환
    return {
      media_id: Number(mediaFile.mediaId),
      uploader_profile_id: Number(mediaFile.uploaderProfileId),
      uploader_type: mediaFile.uploaderType.toLowerCase() as 'parent' | 'child',
      file_name: mediaFile.fileName,
      mime_type: mediaFile.mimeType,
      file_size: Number(mediaFile.fileSize),
      s3_key: mediaFile.s3Key,
      cdn_url: mediaFile.cdnUrl || '',
      created_at: mediaFile.createdAt,
    };
  }

  async getMediaByUploader(
    uploaderProfileId: number,
    uploaderType: UploaderType,
  ): Promise<MediaResponse[]> {
    this.logger.log('업로더별 미디어 조회', {
      uploaderProfileId,
      uploaderType,
    });

    const mediaFiles = await this.prisma.mediaFile.findMany({
      where: {
        uploaderProfileId: BigInt(uploaderProfileId),
        uploaderType: uploaderType.toUpperCase() as 'PARENT' | 'CHILD',
      },
      orderBy: { createdAt: 'desc' },
    });

    return mediaFiles.map((mediaFile) => ({
      media_id: Number(mediaFile.mediaId),
      uploader_profile_id: Number(mediaFile.uploaderProfileId),
      uploader_type: mediaFile.uploaderType.toLowerCase() as 'parent' | 'child',
      file_name: mediaFile.fileName,
      mime_type: mediaFile.mimeType,
      file_size: Number(mediaFile.fileSize),
      s3_key: mediaFile.s3Key,
      cdn_url: mediaFile.cdnUrl || '',
      created_at: mediaFile.createdAt,
    }));
  }

  async deleteMedia(mediaId: number): Promise<void> {
    this.logger.log('미디어 삭제', { mediaId });

    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { mediaId: BigInt(mediaId) },
    });

    if (!mediaFile) {
      throw new Error(`미디어 파일을 찾을 수 없습니다: ${mediaId}`);
    }

    // S3에서 파일 삭제
    await this.s3Service.deleteFile(mediaFile.s3Key);

    // 데이터베이스에서 레코드 삭제
    await this.prisma.mediaFile.delete({
      where: { mediaId: BigInt(mediaId) },
    });
  }
}
