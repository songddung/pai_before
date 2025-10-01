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

  // 전체 대화 데이터를 DB 형태로 저장
  async saveFullConversationData(
    conversationId: string,
    data: {
      childId: string;
      title?: string;
      initialImageS3Url?: string;
      questions: {
        questionText: string;
        answerText: string;
        vqaDirectAnswer?: string;
        questionOrder: number;
      }[];
    },
  ): Promise<void> {
    const key = `conversation:${conversationId}`;
    const now = new Date().toISOString();

    // DB 스키마와 동일한 구조로 저장
    const conversationData = {
      childId: data.childId,
      title: data.title || null,
      initialImageS3Url: data.initialImageS3Url || null,
      createdAt: now,
      questions: data.questions.map(q => ({
        questionText: q.questionText,
        questionOrder: q.questionOrder,
        createdAt: now,
        answer: {
          answerText: q.answerText,
          vqaDirectAnswer: q.vqaDirectAnswer || null,
          createdAt: now,
        }
      }))
    };

    await this.client.set(key, JSON.stringify(conversationData));
    await this.client.expire(key, 86400); // 24시간 TTL
  }

  // 대화 데이터 조회 (DB에 바로 저장 가능한 형태)
  async getConversationData(conversationId: string): Promise<any> {
    const key = `conversation:${conversationId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Redis 데이터 삭제
  async deleteConversationData(conversationId: string): Promise<void> {
    const key = `conversation:${conversationId}`;
    await this.client.del(key);
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