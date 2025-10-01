import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { randomUUID } from 'node:crypto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnBaseUrl: string;

  constructor(private configService: ConfigService) {
    // 환경변수에서 직접 읽기
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const cdnBaseUrl = process.env.S3_CDN_BASE_URL;

    if (
      !region ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !cdnBaseUrl
    ) {
      this.logger.error('AWS 환경변수가 설정되지 않았습니다');
      throw new Error('AWS 설정이 완료되지 않았습니다');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
    this.cdnBaseUrl = cdnBaseUrl;

    this.logger.log(
      `S3 클라이언트 초기화 완료 - Region: ${region}, Bucket: ${bucketName}`,
    );
  }

  /**
   * 파일을 s3에 업로드
   */
  async uploadFile(
    file: any,
    uploaderProfileId: number,
  ): Promise<{
    s3Key: string;
    cdnUrl: string;
    fileSize: number;
  }> {
    try {
      // 고유한 S3 키 생성 (UUID + 원본 파일명)
      const fileExtension = path.extname(file.originalname);
      const fileName = path.basename(file.originalname, fileExtension);
      const uniqueFileName = `${fileName}_${randomUUID()}${fileExtension}`;
      const s3Key = `pai/${uploaderProfileId}/${uniqueFileName}`;

      // S3 업로드 명령어 생성
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Metadata: {
        //   originalName: file.originalname,
        //   uploaderProfileId: uploaderProfileId.toString(),
        // },
      });

      // S3에 업로드 실행
      await this.s3Client.send(uploadCommand);

      // CDN URL 생성
      const cdnUrl = `${this.cdnBaseUrl}/${s3Key}`;

      this.logger.log(`파일 업로드 성공: ${s3Key}`);

      return {
        s3Key,
        cdnUrl,
        fileSize: file.size,
      };
    } catch (error) {
      this.logger.error(`파일 업로드 실패: ${error.message}`, error.stack);
      throw new Error(`파일 업로드에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * S3에서 파일을 삭제합니다
   */
  async deleteFile(s3Key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(deleteCommand);
      this.logger.log(`파일 삭제 성공: ${s3Key}`);
    } catch (error) {
      this.logger.error(`파일 삭제 실패: ${error.message}`, error.stack);
      throw new Error(`파일 삭제에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 파일 다운로드용 presigned URL을 생성합니다
   */
  async generatePresignedUrl(
    s3Key: string,
    expiresIn: number = 3600, // 1시간 기본값
  ): Promise<string> {
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, getObjectCommand, {
        expiresIn,
      });

      this.logger.log(`Presigned URL 생성 성공: ${s3Key}`);
      return presignedUrl;
    } catch (error) {
      this.logger.error(
        `Presigned URL 생성 실패: ${error.message}`,
        error.stack,
      );
      throw new Error(`다운로드 URL 생성에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * CDN URL에서 S3 키를 추출합니다
   */
  extractS3KeyFromCdnUrl(cdnUrl: string): string {
    return cdnUrl.replace(`${this.cdnBaseUrl}/`, '');
  }
}
