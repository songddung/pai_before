import { Module } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { ProfileService } from './profile.service';
import { RedisService } from 'src/services/redis.service';
import { ProfileController } from './profile.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-default-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, RedisService],
  exports: [ProfileService],
})
export class ProfileModule {}
