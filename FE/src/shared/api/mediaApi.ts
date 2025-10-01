import { createApiClient, SERVICE_URLS, handleApiResponse } from './client';
import { tokenUtils, JWTPayload } from '../utils/token';

// 미디어 서비스 전용 API 클라이언트
const mediaApiClient = createApiClient(SERVICE_URLS.MEDIA);

interface UploadFileRequest {
  file: any; // FormData에서 사용할 파일 객체
  uploaderId?: string;
  uploaderType?: 'PARENT' | 'CHILD';
}

interface UploadFileResponse {
  media_id: number | string;
  cdn_url?: string;
  s3_url?: string;
  s3Url?: string;
  url?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  uploader_profile_id: number;
  uploader_type: string;
  created_at: string;
}

interface MediaQuery {
  uploaderProfileId: string;
  uploaderType?: 'PARENT' | 'CHILD';
  page?: number;
  limit?: number;
}

export const mediaApi = {
  // 파일 업로드 (이미지, 음성 등)
  async uploadFile(data: UploadFileRequest): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', data.file);

    // uploader_id와 uploader_type은 필수 필드
    formData.append('uploader_id', data.uploaderId || '');
    formData.append('uploader_type', data.uploaderType || 'PARENT');

    const response = await mediaApiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse<UploadFileResponse>(response);
  },

  // 이미지 업로드 (기존 메서드 유지)
  async uploadImage(
    imageUri: string,
    uploaderId?: string,
    uploaderType: 'PARENT' | 'CHILD' = 'PARENT',
  ): Promise<{ media_id: string; s3_url: string }> {
    try {
      console.log('mediaApi.uploadImage 호출:', { imageUri, uploaderId, uploaderType });

      const localUri = imageUri;
      const filename = localUri.split('/').pop() || 'image.jpg';

      const file = {
        uri: localUri,
        name: filename,
        type: 'image/jpeg',
      } as any;

      console.log('파일 정보:', file);

      const result = await this.uploadFile({
        file,
        uploaderId,
        uploaderType,
      });

      console.log('uploadFile 결과:', result);

      // media_id와 s3_url 모두 반환
      return {
        media_id: String(result.media_id),
        s3_url: result.cdn_url || result.s3_url || result.s3Url || result.url || '' // 백엔드는 cdn_url로 반환
      };
    } catch (error: any) {
      console.error('mediaApi.uploadImage 실패:', error);
      throw error;
    }
  },

  // S3 URL 전용 이미지 업로드 메서드 추가
  async uploadImageToS3(imageUri: string, accessToken?: string): Promise<{ s3_url: string }> {
    try {
      console.log('S3 이미지 업로드 시작:', imageUri);

      // JWT에서 사용자 정보 추출
      let uploaderId = '';
      let uploaderType: 'PARENT' | 'CHILD' = 'PARENT';

      if (accessToken) {
        try {
          const tokenData = tokenUtils.decodeToken(accessToken);
          if (tokenData) {
            // userId 추출 (media-service에서 요구하는 필드)
            uploaderId = tokenData.sub || tokenData.user_id || tokenData.userId || '';
            uploaderType = (tokenData.profile_type as 'PARENT' | 'CHILD') || 'PARENT';
          }
        } catch (tokenError) {
          console.warn('토큰 디코딩 실패:', tokenError);
        }
      }

      console.log('업로드 정보:', { uploaderId, uploaderType });

      const result = await this.uploadImage(imageUri, uploaderId, uploaderType);

      if (!result.s3_url) {
        throw new Error('S3 URL을 받을 수 없습니다');
      }

      console.log('S3 업로드 완료:', result.s3_url);
      return { s3_url: result.s3_url };
    } catch (error: any) {
      console.error('S3 업로드 실패:', error);
      throw error;
    }
  },

  // 미디어 조회
  async getMedia(mediaId: string) {
    const response = await mediaApiClient.get(`/api/media/${mediaId}`);
    return handleApiResponse(response);
  },

  // 사용자 미디어 목록 조회
  async getUserMedia(params: MediaQuery) {
    const queryParams = new URLSearchParams({
      ...(params.uploaderType && { uploaderType: params.uploaderType }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    const response = await mediaApiClient.get(
      `/api/media/user/${params.uploaderProfileId}?${queryParams}`
    );
    return handleApiResponse(response);
  },

  // 미디어 삭제
  async deleteMedia(mediaId: string) {
    const response = await mediaApiClient.delete(`/api/media/${mediaId}`);
    return handleApiResponse(response);
  },
};
