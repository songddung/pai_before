import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaService } from '../services/prisma.service';
import { SchedulerService } from '../services/scheduler.service';
import { OpenAIService } from '../services/openai.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [QuizController],
  providers: [QuizService, PrismaService, SchedulerService, OpenAIService],
  exports: [QuizService],
})
export class QuizModule {}