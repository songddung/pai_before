import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
    });
  }

  // Refresh Token 저장
  async setRefreshToken(
    userId: string,
    refreshToken: string,
    ttl: number,
  ): Promise<void> {
    await this.client.setex(`refresh:${userId}`, ttl, refreshToken);
  }

  // Refresh Token 조회
  async getRefreshToken(userId: string): Promise<string | null> {
    return await this.client.get(`refresh:${userId}`);
  }

  // Refresh Token 삭제
  async deleteRefreshToken(userId: string): Promise<void> {
    await this.client.del(`refresh:${userId}`);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setex(key, seconds, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
