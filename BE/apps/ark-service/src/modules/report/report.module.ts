import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ReportController],
  providers: [ReportService, PrismaService],
  exports: [ReportService],
})
export class ReportModule {}