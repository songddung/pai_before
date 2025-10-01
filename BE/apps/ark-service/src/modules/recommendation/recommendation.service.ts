import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
  RecommendationRequestDto,
  RecommendationResponseDto,
  FestivalDto,
} from '@your-org/shared-types';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getRecommendations(childId: string, authHeader?: string) {
    console.log('관심사 조회 및 추천 생성 중:', { childId, childIdType: typeof childId });

    if (!childId) {
      throw new BadRequestException('childId가 필요합니다.');
    }

    // 1. ChildInterest에서 해당 아이의 모든 관심사 조회 (mention_count 내림차순)
    const childInterests = await this.prismaService.childInterest.findMany({
      where: {
        childId: BigInt(childId),
      },
      orderBy: {
        mentionCount: 'desc',
      },
    });

    console.log('조회된 관심사:', childInterests.length, '개');

    if (childInterests.length === 0) {
      console.log('관심사 데이터가 없어 기본 응답 반환');
      return {
        child_id: childId,
        interests: [],
        top_category: null,
        recommendations: null,
        message: '아이의 관심사 데이터가 아직 없습니다. 대화를 더 나눠보세요.',
      };
    }

    // 관심사 데이터를 반환용 형식으로 변환
    const interests = childInterests.map((interest) => ({
      category: interest.category,
      mention_count: interest.mentionCount,
      last_updated: interest.lastUpdated.toISOString(),
    }));

    const interestsData = {
      child_id: childId,
      interests: interests,
      top_category: interests[0]?.category || null,
    };

    // 2. Gateway를 통해 Child의 User 정보 조회 (좌표 가져오기)
    let userCoordinates = { lat: 37.5665, lon: 126.9780 }; // 서울 기본 좌표

    try {
      const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3006';

      // Authorization 헤더 설정
      const headers = authHeader ? { Authorization: authHeader } : {};

      const userResponse = await firstValueFrom(
        this.httpService.get(`${gatewayUrl}/api/users/child/${childId}/coordinates`, { headers })
      );

      if (userResponse.data && (userResponse.data as any).latitude && (userResponse.data as any).longitude) {
        userCoordinates = {
          lat: (userResponse.data as any).latitude,
          lon: (userResponse.data as any).longitude,
        };
      }
    } catch (error) {
      console.warn('사용자 좌표 조회 실패, 기본 좌표 사용:', error);
    }

    // 3. Gateway를 통해 AI 서비스에 추천 요청
    try {
      const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3006';

      // Authorization 헤더 설정
      const headers = authHeader ? { Authorization: authHeader } : {};

      console.log('AI 추천 요청:', {
        gatewayUrl: `${gatewayUrl}/api/ai/recommend`,
        payload: {
          user_id: parseInt(childId),
          profile_id: parseInt(childId),
          category: interestsData.top_category || '기타',
          keyword: interests.map(i => i.category).join(' '),
          lat: userCoordinates.lat,
          lon: userCoordinates.lon,
        }
      });

      const response = await firstValueFrom(
        this.httpService.post(`${gatewayUrl}/api/ai/recommend`, {
          user_id: parseInt(childId),
          profile_id: parseInt(childId),
          category: interestsData.top_category || '기타',
          keyword: interests.map(i => i.category).join(' '),
          lat: userCoordinates.lat,
          lon: userCoordinates.lon,
        }, { headers }),
      );

      console.log('AI 추천 응답 상태:', response.status);
      console.log('AI 추천 응답 타입:', typeof (response as any).data);

      // HTML 응답 체크 (시스템 점검 페이지 등)
      const responseData = (response as any).data;
      console.log('AI 서비스 응답 타입 및 내용 확인:', {
        type: typeof responseData,
        isString: typeof responseData === 'string',
        hasHtml: typeof responseData === 'string' && responseData.includes('<!DOCTYPE html>'),
        hasSystemCheck: typeof responseData === 'string' && responseData.includes('시스템 점검'),
        contentPreview: typeof responseData === 'string' ? responseData.substring(0, 100) : 'Not string',
      });

      if (typeof responseData === 'string' &&
          (responseData.includes('<!DOCTYPE html>') || responseData.includes('시스템 점검'))) {
        console.log('AI 서비스에서 HTML 시스템 점검 페이지 응답 받음');
        throw new Error('AI 서비스 시스템 점검 중');
      }

      // 객체 내부에 error 텍스트가 있는 경우도 체크
      if (responseData && typeof responseData === 'object' && responseData.text &&
          typeof responseData.text === 'string' &&
          (responseData.text.includes('<!DOCTYPE html>') || responseData.text.includes('시스템 점검'))) {
        console.log('AI 서비스 응답 객체 내부에 HTML 시스템 점검 페이지 발견');
        throw new Error('AI 서비스 시스템 점검 중');
      }

      return {
        ...interestsData,
        recommendations: responseData,
      };
    } catch (error) {
      console.error('AI 서비스 추천 요청 실패:', error);

      // AI 서비스 실패 시 mock 데이터 반환
      const mockRecommendations = {
        festivals: [
          {
            title: "서울숲",
            address: "서울특별시 성동구 성수동",
            lat: 37.5446,
            lon: 127.0379,
            distance_km: 5.2,
            first_image: "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=9f1c2b0e-25a7-4d02-8c65-123412341234",
            tel: "02-123-4567",
          },
          {
            title: "국립과천과학관",
            address: "경기도 과천시 상하벌로 110",
            lat: 37.4292,
            lon: 126.9877,
            distance_km: 12.3,
            first_image: "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=1b1c2b0e-25a7-4d02-8c65-555555555555",
            tel: "031-123-4567",
          }
        ],
        translated_category: interestsData.top_category || '기타',
        translated_keyword: interests.map(i => i.category).join(', ')
      };

      return {
        ...interestsData,
        recommendations: mockRecommendations,
        error: 'AI 서비스 일시 중단으로 샘플 데이터를 제공합니다.',
      };
    }
  }
}
