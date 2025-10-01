import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, PrismaService],
  exports: [AnalysisService],
})
export class AnalysisModule {}