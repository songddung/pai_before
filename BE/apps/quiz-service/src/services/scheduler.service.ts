import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 매일 자정 (KST 기준)에 이전 날짜 퀴즈들을 비활성화
  @Cron('0 0 * * *', {
    name: 'deactivate-old-quizzes',
    timeZone: 'Asia/Seoul',
  })
  async deactivateOldQuizzes() {
    try {
      this.logger.log('오래된 퀴즈 비활성화 작업 시작...');

      // 한국 시간 기준 오늘 날짜 계산
      const now = new Date();
      const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const today = kstDate.toISOString().split('T')[0];

      // 오늘 이전 날짜의 활성화된 퀴즈들을 비활성화
      const result = await this.prisma.quiz.updateMany({
        where: {
          isActive: true,
          quizDate: {
            lt: new Date(today),
          },
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`${result.count}개의 오래된 퀴즈를 비활성화했습니다.`);
    } catch (error) {
      this.logger.error('오래된 퀴즈 비활성화 중 오류 발생:', error);
    }
  }
}