import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { OpenAIService } from '../services/openai.service';
import { CreateQuizDto } from 'src/dto/create-quiz.dto';
import { UpdateQuizDto } from 'src/dto/update-quiz.dto';
import { SubmitQuizDto } from 'src/dto/submit-quiz.dto';
import { QuizResponse, AvailableQuizResponse, QuizResultInfo, QuizSubmitResponse, ChildQuizResult, AllChildrenQuizzesResponse } from '@your-org/shared-types';

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenAIService,
  ) {}

  // 한국 시간 기준 오늘 날짜 계산 (YYYY-MM-DD)
  private getKSTToday(): string {
    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return kstDate.toISOString().split('T')[0];
  }

  // 날짜 문자열을 UTC 기준 Date 객체로 변환 (00:00:00)
  private getUTCDateFromString(dateString: string): Date {
    return new Date(dateString + 'T00:00:00.000Z');
  }

  // 퀴즈 생성 (부모 전용)
  async createQuiz(profileId: string, createQuizDto: CreateQuizDto): Promise<QuizResponse> {
    const today = this.getKSTToday();
    const parentId = BigInt(profileId);

    // 오늘 이미 퀴즈를 생성했는지 확인
    const existingQuiz = await this.prisma.quiz.findFirst({
      where: { parentId, QuizDate: this.getUTCDateFromString(today), },
    });

    if (existingQuiz) {
      throw new Error('DUPLICATE_QUIZ_TODAY');
    }

    // 퀴즈 생성
    const quiz = await this.prisma.quiz.create({
      data: {
        parentId,
        question: createQuizDto.question,
        answer: createQuizDto.answer,
        reward: createQuizDto.reward,
        QuizDate: this.getUTCDateFromString(today),
        isActive: true,
      },
    });

    return {
      id: quiz.id.toString(),
      parentId: quiz.parentId.toString(),
      question: quiz.question,
      answer: quiz.answer,
      reward: quiz.reward,
      quizDate: today,
      isActive: quiz.isActive,
      createdAt: quiz.createdAt.toISOString(),
    };
  }

  // 퀴즈 수정 (부모 전용)
  async updateQuiz(
    quizId: string,
    profileId: string,
    updateQuizDto: UpdateQuizDto
  ): Promise<QuizResponse> {
    const id = BigInt(quizId);
    const parentId = BigInt(profileId);

    // 퀴즈 존재 여부 및 소유권 확인
    const existingQuiz = await this.prisma.quiz.findFirst({
      where: { id, parentId, },
      include: {
        results: true, // 퀴즈 시도 결과 포함
      },
    });

    if (!existingQuiz) {
      throw new Error('QUIZ_NOT_FOUND');
    }

    // 수정 가능 조건 검증
    const today = this.getKSTToday();
    const quizDate = existingQuiz.QuizDate.toISOString().split('T')[0];

    // 1. 오늘 생성한 퀴즈만 수정 가능
    if (quizDate !== today) {
      throw new Error('QUIZ_NOT_EDITABLE_DATE');
    }

    // 2. 아무도 시도하지 않은 퀴즈만 수정 가능
    if (existingQuiz.results.length > 0) {
      throw new Error('QUIZ_ALREADY_ATTEMPTED');
    }

    // 퀴즈 수정
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data: {
        ...(updateQuizDto.question && { question: updateQuizDto.question }),
        ...(updateQuizDto.answer && { answer: updateQuizDto.answer }),
        ...(updateQuizDto.reward !== undefined && { reward: updateQuizDto.reward }),
      },
    });

    return {
      id: quiz.id.toString(),
      parentId: quiz.parentId.toString(),
      question: quiz.question,
      answer: quiz.answer,
      reward: quiz.reward,
      quizDate: existingQuiz.QuizDate.toISOString().split('T')[0],
      isActive: quiz.isActive,
      createdAt: quiz.createdAt.toISOString(),
    };
  }

  // 퀴즈 삭제 (부모 전용)
  async deleteQuiz(quizId: string, profileId: string): Promise<void> {
    const id = BigInt(quizId);
    const parentId = BigInt(profileId);

    // 퀴즈 존재 여부 및 소유권 확인
    const existingQuiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        parentId,
      },
    });

    if (!existingQuiz) {
      throw new Error('QUIZ_NOT_FOUND');
    }

    // 퀴즈 삭제
    await this.prisma.quiz.delete({
      where: { id },
    });
  }

  // user-service에서 같은 가족(동일 user_id)의 부모 프로필 ID들 조회
  private async getParentProfileIds(authHeader: string): Promise<string[]> {
    try {
      const USER_SERVICE_URL = process.env.USER_SERVICE_URL || (process.env.NODE_ENV === 'production' ? 'http://user-service:3001' : 'http://localhost:3001');

      console.log('👤 부모 프로필 조회 시작');
      console.log('🔑 Authorization 헤더:', authHeader ? '존재함' : '없음');

      const response = await fetch(`${USER_SERVICE_URL}/api/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader, // JWT 토큰 그대로 전달 (동일 user_id의 프로필들만 조회됨)
        },
      });

      if (!response.ok) {
        console.error('❌ User service 응답 실패:', response.status, response.statusText);
        throw new Error(`User service error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 User service 전체 응답:', JSON.stringify(data, null, 2));

      // 응답 데이터 구조 확인
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('❌ 잘못된 응답 구조:', data);
        return [];
      }

      console.log('👨‍👩‍👧‍👦 전체 프로필 개수:', data.data.length);

      // 동일 user_id의 PARENT 타입 프로필들만 필터링
      const parentProfiles = data.data.filter((profile: any) => {
        const isParent = profile && profile.profile_type === 'PARENT';
        console.log(`프로필 ${profile?.profile_id}: ${profile?.name} (${profile?.profile_type}) - 부모 여부: ${isParent}`);
        return isParent;
      });

      console.log('👨‍👨‍👧‍👦 필터링된 부모 프로필들:', parentProfiles);

      const parentIds = parentProfiles
        .filter((profile: any) => profile && profile.profile_id)
        .map((profile: any) => profile.profile_id.toString());

      console.log('🎯 최종 부모 프로필 ID들:', parentIds);

      return parentIds;
    } catch (error) {
      console.error('❌ 부모 프로필 조회 실패:', error);
      // 에러 시 빈 배열 반환 (퀴즈 조회 안됨)
      return [];
    }
  }

  // user-service에서 같은 가족의 자녀 프로필 ID들 조회
  private async getChildrenProfileIds(authHeader: string): Promise<{id: string, name: string}[]> {
    try {
      const USER_SERVICE_URL = process.env.USER_SERVICE_URL || (process.env.NODE_ENV === 'production' ? 'http://user-service:3001' : 'http://localhost:3001');
      const response = await fetch(`${USER_SERVICE_URL}/api/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader, // JWT 토큰 그대로 전달
        },
      });

      if (!response.ok) {
        throw new Error(`User service error: ${response.status}`);
      }

      const data = await response.json();

      // CHILD 타입인 프로필들의 ID랑 NAME 추출
      const childProfiles = data.data.filter((profile: any) => profile.profile_type === 'CHILD');
      return childProfiles.map((profile: any) => ({
        id: profile.profile_id.toString(),
        name: profile.name
      }));
    } catch (error) {
      console.error('Failed to fetch child profiles', error);
      // 에러 시 빈 배열 반환 (퀴즈 조회 안 됨)
      return [];
    }
  }

  // 아이용 오늘 퀴즈 목록 조회 (아이 전용)
  async getAvailableQuizzes(childId: string, authHeader: string): Promise<AvailableQuizResponse[]> {
    const today = this.getKSTToday();
    const childIdBigInt = BigInt(childId);

    console.log('=== getAvailableQuizzes 디버깅 ===');
    console.log('childId:', childId);
    console.log('today:', today);
    console.log('authHeader:', authHeader ? 'exists' : 'missing');

    // 1. 같은 가족의 부모 프로필 ID들 조회
    const parentProfileIds = await this.getParentProfileIds(authHeader);
    console.log('parentProfileIds:', parentProfileIds);

    if (parentProfileIds.length === 0) {
      console.log('부모 프로필이 없어서 빈 배열 반환');
      return []; // 부모 프로필이 없으면 빈 배열 반환
    }

    // 전체 퀴즈 개수만 확인 (성능상 세부 로그 제거)
    const allQuizzesCount = await this.prisma.quiz.count();
    console.log('💾 DB 전체 퀴즈 개수:', allQuizzesCount);

    console.log('🔍 조회 조건:');
    console.log('- 찾는 날짜:', this.getUTCDateFromString(today).toISOString());
    console.log('- 부모 프로필 IDs:', parentProfileIds);
    console.log('- BigInt 변환된 부모 IDs:', parentProfileIds.map(id => BigInt(id)));

    // 2. 가족 부모들이 만든 오늘의 퀴즈만 조회
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        QuizDate: this.getUTCDateFromString(today),
        parentId: {
          in: parentProfileIds.map(id => BigInt(id)), // 가족 부모들의 퀴즈만
        },
      },
      include: {
        results: {
          where: { childId: childIdBigInt, },
        },
      },
      orderBy: { createdAt: 'desc', },
    });

    console.log('🎯 조건에 맞는 퀴즈 개수:', quizzes.length);

    return quizzes.map(quiz => {
      const myResult = quiz.results.length > 0 ? quiz.results[0] : null;

      return {
        id: quiz.id.toString(),
        parentId: quiz.parentId.toString(),
        question: quiz.question,
        reward: quiz.reward,
        quizDate: today,
        isActive: quiz.isActive,
        myResult: myResult ? {
          isSolved: myResult.isSolved,
          totalAttempts: myResult.totalAttempts,
          rewardGiven: myResult.rewardGiven,
        } as QuizResultInfo : null,
      };
    });
  }

  // 퀴즈 제출 (아이 전용)
  async submitQuiz(quizId: string, childId: string, submitQuizDto: SubmitQuizDto): Promise<QuizSubmitResponse> {
    const today = this.getKSTToday();
    const quizIdBigInt = BigInt(quizId);
    const childIdBigInt = BigInt(childId);

    // 1. 퀴즈 존재 및 오늘 퀴즈인지 확인
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizIdBigInt },
    });

    if (!quiz) {
      throw new HttpException('QUIZ_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const quizDate = quiz.QuizDate.toISOString().split('T')[0];
    if (quizDate !== today) {
      throw new HttpException('QUIZ_NOT_AVAILABLE', HttpStatus.GONE);
    }

    if (!quiz.isActive) {
      throw new HttpException('QUIZ_INACTIVE', HttpStatus.GONE);
    }

    // 2. 기존 결과 조회
    const existingResult = await this.prisma.quizResult.findUnique({
      where: {
        quizId_childId: { quizId: quizIdBigInt, childId: childIdBigInt, },
      },
    });

    // 3. 이미 정답을 맞췄으면 409
    if (existingResult?.isSolved) {
      throw new HttpException('QUIZ_ALREADY_SOLVED', HttpStatus.CONFLICT);
    }

    // 4. 의미적 유사도 계산 (OpenAI Embeddings)
    const similarity = await this.openaiService.calculateSemanticSimilarity(
      quiz.answer,
      submitQuizDto.answer
    );

    // 정답 판정: 90% 이상이면 정답으로 처리
    const isCorrect = similarity >= 90;

    // 5. 결과 저장/업데이트
    const newAttempts = (existingResult?.totalAttempts || 0) + 1;

    await this.prisma.quizResult.upsert({
      where: {
        quizId_childId: { quizId: quizIdBigInt, childId: childIdBigInt, },
      },
      update: {
        isSolved: isCorrect,
        totalAttempts: newAttempts,
        ...(isCorrect && { completedAt: new Date() }),
      },
      create: {
        quizId: quizIdBigInt,
        childId: childIdBigInt,
        isSolved: isCorrect,
        totalAttempts: newAttempts,
        startedAt: new Date(),
        ...(isCorrect && { completedAt: new Date() }),
      },
    });

    // 6. 응답 메시지 생성
    let message: string;
    if (isCorrect) {
      message = '정답입니다! 🎇';
    } else if (similarity >= 80) {
      message = '아쉬워요! 거의 다 왔어요 😉';
    } else if (similarity >= 60) {
      message = '조금 더 생각해보세요 🤔';
    } else {
      message = '다시 한번 도전해보세요! 🧐';
    }

    return {
      isSolved: isCorrect,
      similarity,
      totalAttempts: newAttempts,
      message,
    };
  }

  // 부모가 모든 자녀의 오늘 퀴즈 결과 조회 (부모 전용)
  async getAllChildrenQuizzes(parentProfile: string, authHeader: string): Promise<AllChildrenQuizzesResponse[]> {
    const today = this.getKSTToday();

    // 1. 같은 가족의 자녀 프로필 조회
    const childrenProfileIds = await this.getChildrenProfileIds(authHeader);

    if (childrenProfileIds.length === 0) {
      return []; // 자녀가 없으면 빈 배열 반환
    }

    // 2. 오늘 날짜의 모든 퀴즈 조회
    const todayQuizzes = await this.prisma.quiz.findMany({
      where: { QuizDate: new Date(today), },
      include: { results: true, },
      orderBy: { createdAt: 'desc', },
    });

    // 3. 자녀별로 그룹핑해서 결과 생성
    const result: AllChildrenQuizzesResponse[] = childrenProfileIds.map(child => {
      const childId = BigInt(child.id);

      const childQuizResults: ChildQuizResult[] = todayQuizzes.map(quiz => {
        // 해당 자녀의 결과 찾기
        const childResult = quiz.results.find(result => result.childId.toString() === child.id);

        return {
          id: quiz.id.toString(),
          parentId: quiz.parentId.toString(),
          question: quiz.question,
          answer: quiz.answer,
          reward: quiz.reward,
          quizDate: today,
          isActive: quiz.isActive,
          createdAt: quiz.createdAt.toISOString(),
          childResult: childResult ? {
            resultId: childResult.id.toString(),
            isSolved: childResult.isSolved,
            totalAttempts: childResult.totalAttempts,
            rewardGiven: childResult.rewardGiven,
            completedAt: childResult.completedAt?.toISOString() || null,
          } : {
            resultId: null,
            isSolved: false,
            totalAttempts: 0,
            rewardGiven: false,
            completedAt: null,
          },
        } as ChildQuizResult;
      });
      return {
        childId: child.id,
        childName: child.name,
        completedQuizzes: childQuizResults,
      };
    });
    return result;
  }

  // 보상 지급 처리 (부모 전용)
  async giveReward(quizResultId: string, parentProfileId: string): Promise<{ rewardGiven: boolean }> {
    const quizResultIdBigInt = BigInt(quizResultId);
    const parentId = BigInt(parentProfileId);

    // 1. 퀴즈 결과 조회 (퀴즈 정보 포함)
    const quizResult = await this.prisma.quizResult.findUnique({
      where: { id: quizResultIdBigInt },
      include: { quiz: true, } // 퀴즈 정보 포함 (부모 ID 확인용)
    });

    if (!quizResult) {
      throw new HttpException('퀴즈 결과를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    }

    // 2. 부모 권한 확인 (퀴즈 작성자가 현재 부모인지)
    if (quizResult.quiz.parentId !== parentId) {
      throw new HttpException('해당 퀴즈에 대한 권한이 없습니다', HttpStatus.FORBIDDEN);
    }

    // 3. 정답을 맞춘 결과인지 확인
    if (!quizResult.isSolved) {
      throw new HttpException('정답을 맞추지 않은 퀴즈에는 보상을 줄 수 없습니다', HttpStatus.BAD_REQUEST);
    }

    // 4. 이미 보상을 지급했는지 확인
    if (quizResult.rewardGiven) {
      throw new HttpException('이미 보상이 지급된 퀴즈입니다', HttpStatus.CONFLICT);
    }

    // 5. 보상 지급 처리
    await this.prisma.quizResult.update({
      where: { id: quizResultIdBigInt },
      data: { rewardGiven: true },
    });

    return { rewardGiven: true };
  }

}