import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../services/prisma.service';
import { RedisService } from '../services/redis.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, RedisService],
  exports: [ConversationService],
})
export class ConversationModule {}