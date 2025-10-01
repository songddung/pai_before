import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '../services/redis.service';
import { PrismaService } from '../services/prisma.service';
import { firstValueFrom } from 'rxjs';

interface ConversationData {
  childId: string;
  title?: string;
  initialImageS3Url?: string;
  questions: {
    questionText: string;
    answerText: string;
    vqaDirectAnswer?: string;
    questionOrder: number;
  }[];
}

@Injectable()
export class ConversationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async startConversation(conversationId: string, data: ConversationData): Promise<void> {
    await this.redisService.saveFullConversationData(conversationId, data);
  }

  async endConversation(conversationId: string, profileType: string, authToken?: string): Promise<{ isChild: boolean }> {
    // Redis에서 데이터 조회
    const conversationData = await this.redisService.getConversationData(conversationId);

    // 데이터가 없으면 에러
    if (!conversationData || !conversationData.childId || !conversationData.questions?.length) {
      throw new Error('대화 데이터를 찾을 수 없습니다');
    }

    if (profileType === 'CHILD' || profileType === 'child') {
      // child 프로필: Redis → DB 저장 후 Redis 삭제
      await this.saveConversationToDatabase(conversationData, authToken);
      await this.redisService.deleteConversationData(conversationId);
      return { isChild: true };
    } else if (profileType === 'PARENT' || profileType === 'parent') {
      // parent 프로필: Redis 데이터만 삭제 (DB 저장 안함)
      await this.redisService.deleteConversationData(conversationId);
      return { isChild: false };
    } else {
      throw new Error('잘못된 프로필 타입입니다');
    }
  }

  async getRedisData(conversationId: string) {
    const conversationData = await this.redisService.getConversationData(conversationId);
    return {
      conversation: conversationData,
    };
  }

  private async saveConversationToDatabase(conversationData: any, authToken?: string) {
    const conversation = await this.prismaService.$transaction(async (prisma) => {
      // 대화 생성
      const conversation = await prisma.conversation.create({
        data: {
          childId: BigInt(conversationData.childId),
          title: conversationData.title,
          initialImageS3Url: conversationData.initialImageS3Url,
          createdAt: new Date(conversationData.createdAt),
          endAt: new Date(),
        },
      });

      // 질문과 답변 생성
      for (const questionData of conversationData.questions) {
        const question = await prisma.question.create({
          data: {
            conversationId: conversation.id,
            questionText: questionData.questionText,
            questionOrder: questionData.questionOrder,
            createdAt: new Date(questionData.createdAt),
          },
        });

        await prisma.answer.create({
          data: {
            questionId: question.id,
            answerText: questionData.answer.answerText,
            vqaDirectAnswer: questionData.answer.vqaDirectAnswer,
            createdAt: new Date(questionData.answer.createdAt),
          },
        });
      }

      return conversation;
    });

    // DB 저장 완료 후 /api/ark/analysis API 호출
    await this.sendAnalyticData(conversation, conversationData, authToken);

    return conversation;
  }
  // /api/ark/analysis에 전송할 데이터 만들기
  private async sendAnalyticData(conversation: any, conversationData: any, authToken?: string) {
    try {
      // 모든 질문 추출
      const extractedKeywords = conversationData.questions.map(q => q.questionText);

      const analyticPayload = {
        conversation_id: conversation.id.toString(),
        child_id: conversationData.childId.toString(),
        category: conversationData.title || '',
        extracted_keywords: extractedKeywords,
      };

      const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3006';

      // JWT 토큰 헤더 설정
      const headers = authToken ? { Authorization: authToken } : {};

      await firstValueFrom(
        this.httpService.post(`${gatewayUrl}/api/ark/analysis`, analyticPayload, { headers })
      );

      console.log('Analytics data sent successfully:', analyticPayload);
    } catch (error) {
      console.error('Failed to send analytics data:', error);
      // 분석 API 실패해도 대화 저장은 성공으로 처리
    }
  }

  async getConversationImages(childId: string, page: number = 1, limit: number = 30) {
    const skip = (page - 1) * limit;

    // 전체 개수 조회
    const totalCount = await this.prismaService.conversation.count({
      where: {
        childId: BigInt(childId),
        initialImageS3Url: {
          not: null,
        },
      },
    });

    // 데이터 조회
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        childId: BigInt(childId),
        initialImageS3Url: {
          not: null,
        },
      },
      select: {
        id: true,
        initialImageS3Url: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      items: conversations.map(conv => ({
        conversationId: conv.id.toString(),
        firstQuestionImageUrl: conv.initialImageS3Url,
        createdAt: conv.createdAt.toISOString(),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit,
      },
    };
  }

  async getConversationById(conversationId: string, childId: string) {
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        id: BigInt(conversationId),
        childId: BigInt(childId),
      },
      include: {
        questions: {
          include: {
            answer: true,
          },
          orderBy: {
            questionOrder: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다');
    }

    return {
      id: conversation.id.toString(),
      childId: conversation.childId.toString(),
      title: conversation.title,
      initialImageS3Url: conversation.initialImageS3Url,
      createdAt: conversation.createdAt,
      endAt: conversation.endAt,
      questions: conversation.questions.map(q => ({
        id: q.id.toString(),
        questionText: q.questionText,
        questionOrder: q.questionOrder,
        createdAt: q.createdAt,
        answer: q.answer ? {
          id: q.answer.id.toString(),
          answerText: q.answer.answerText,
          vqaDirectAnswer: q.answer.vqaDirectAnswer,
          createdAt: q.answer.createdAt,
        } : null,
      })),
    };
  }

  async getConversationDetail(conversationId: string) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: BigInt(conversationId),
      },
      include: {
        questions: {
          include: {
            answer: true,
          },
          orderBy: {
            questionOrder: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다');
    }

    return {
      conversationId: conversation.id.toString(),
      childId: Number(conversation.childId),
      title: conversation.title,
      initialImageUrl: conversation.initialImageS3Url,
      createdAt: conversation.createdAt.toISOString(),
      questions: conversation.questions.map(q => ({
        questionOrder: q.questionOrder,
        questionText: q.questionText,
        answerText: q.answer?.answerText || '',
        imageUrl: null, // ERD에 질문별 이미지 필드가 없어서 null
        vqaDirectAnswer: q.answer?.vqaDirectAnswer || null,
      })),
    };
  }
}