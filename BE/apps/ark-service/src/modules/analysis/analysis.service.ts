import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import type {
  CreateAnalysisDto,
  AnalysisQueryDto,
  AnalysisResponseDto,
} from '@your-org/shared-types';

@Injectable()
export class AnalysisService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAnalysis(data: CreateAnalysisDto): Promise<void> {
    console.log('관심사 분석 생성 중:', data);

    // 1. Analytics 테이블에 분석 이력 저장 (점수 없이)
    const analysis = await this.prismaService.analytics.create({
      data: {
        conversationId: BigInt(data.conversation_id),
        childId: BigInt(data.child_id),
        extractedKeywords: data.extracted_keywords,
        category: data.category,
        analysisDate: new Date(),
        createdAt: new Date(),
      },
    });

    console.log('관심사 분석 저장 완료:', analysis);

    // 2. ChildInterest 테이블에서 mention_count만 업데이트
    await this.prismaService.childInterest.upsert({
      where: {
        childId_category: {
          childId: BigInt(data.child_id),
          category: data.category,
        },
      },
      update: {
        mentionCount: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        childId: BigInt(data.child_id),
        category: data.category,
        mentionCount: 1,
        lastUpdated: new Date(),
        createdAt: new Date(),
      },
    });
  }

  async getAnalysis(query: AnalysisQueryDto): Promise<AnalysisResponseDto[]> {
    console.log('관심사 분석 조회 중:', query);

    const where: any = {
      childId: BigInt(query.child_id),
    };

    // 날짜 필터링
    if (query.from_date || query.to_date) {
      where.analysisDate = {};
      if (query.from_date) {
        where.analysisDate.gte = new Date(query.from_date);
      }
      if (query.to_date) {
        where.analysisDate.lte = new Date(query.to_date);
      }
    }

    const analyticsData = await this.prismaService.analytics.findMany({
      where,
      take: query.limit ? parseInt(query.limit.toString()) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (analyticsData.length === 0) {
      throw new NotFoundException('해당 자녀의 분석 결과가 없습니다.');
    }

    // 응답 형식으로 변환 (점수는 고정값으로 계산)
    const result = analyticsData.map((analysis) => ({
      child_id: analysis.childId.toString(),
      extracted_keywords: analysis.extractedKeywords as string[],
      category: analysis.category,
      analysis_date: analysis.analysisDate?.toISOString().split('T')[0] || '',
    }));

    return result;
  }
}
