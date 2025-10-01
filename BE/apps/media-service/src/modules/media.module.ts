import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaService } from '../services/prisma.service';
import { S3Service } from '../services/s3.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, PrismaService, S3Service],
  exports: [MediaService],
})
export class MediaModule {}