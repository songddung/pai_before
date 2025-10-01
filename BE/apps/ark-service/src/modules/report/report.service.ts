import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import type {
  GetReportQueryDto,
  ReportResponseDto,
} from '@your-org/shared-types';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: GetReportQueryDto): Promise<ReportResponseDto> {
    console.log('리포트 조회 중:', query);

    // 입력 유효성 검사
    this.validateReportQuery(query);

    // report_type에 따라 날짜 범위 계산
    const { startDate, endDate } = this.calculateDateRange(query.report_type);
    console.log('계산된 날짜 범위:', { startDate, endDate });

    // 버블차트 데이터 조회
    const bubbleChartData = await this.getBubbleChartData(
      query.child_id,
      startDate,
      endDate,
    );

    return {
      child_id: query.child_id,
      report_type: query.report_type,
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
      bubble_chart_data: bubbleChartData,
    };
  }

  private calculateDateRange(reportType: 'daily' | 'weekly' | 'monthly'): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // 오늘 하루 끝

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // 자정 시작

    switch (reportType) {
      case 'daily':
        // 오늘 하루: 오늘 00:00:00 ~ 23:59:59
        break;

      case 'weekly':
        // 최근 7일: 7일 전 00:00:00 ~ 오늘 23:59:59
        startDate.setDate(now.getDate() - 6); // 오늘 포함 7일
        break;

      case 'monthly':
        // 최근 30일: 30일 전 00:00:00 ~ 오늘 23:59:59
        startDate.setDate(now.getDate() - 29); // 오늘 포함 30일
        break;

      default:
        throw new BadRequestException('잘못된 report_type입니다.');
    }

    return { startDate, endDate };
  }

  private validateReportQuery(query: GetReportQueryDto): void {
    if (!query.child_id) {
      throw new BadRequestException('자녀 ID는 필수입니다.');
    }

    if (!['daily', 'weekly', 'monthly'].includes(query.report_type)) {
      throw new BadRequestException(
        '리포트 타입은 daily, weekly, monthly 중 하나여야 합니다.',
      );
    }
  }

  private async getBubbleChartData(
    childId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    const analytics = await this.prisma.analytics.findMany({
      where: {
        childId: BigInt(childId),
        analysisDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    console.log(`Analytics 조회 결과: ${analytics.length}개`);

    // 카테고리별 카운트
    const categoryCounts: Record<string, number> = {};
    analytics.forEach((analytic) => {
      const category = analytic.category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    return categoryCounts;
  }
}
