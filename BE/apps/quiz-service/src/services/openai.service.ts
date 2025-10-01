import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;
  private readonly embeddingCache = new Map<string, number[]>();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  // 단어의 임베딩 벡터 가져오기 (캐싱 포함)
  async getEmbedding(text: string): Promise<number[]> {
    const normalizedText = text.toLowerCase().trim();

    // 캐시에서 확인
    if (this.embeddingCache.has(normalizedText)) {
      return this.embeddingCache.get(normalizedText)!;
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: normalizedText,
      });

      const embedding = response.data[0].embedding;

      // 캐시에 저장 (메모리 관리를 위해 1000개까지만)
      if (this.embeddingCache.size < 1000) {
        this.embeddingCache.set(normalizedText, embedding);
      }

      return embedding;
    } catch (error) {
      this.logger.error(`Failed to get embedding for "${text}":`, error);
      throw new Error('임베딩 생성에 실패했습니다.');
    }
  }

  // 코사인 유사도 계산
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('벡터 차원이 일치하지 않습니다.');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return similarity;
  }

  // 의미적 유사도 계산 (0-100%)
  async calculateSemanticSimilarity(answer: string, userInput: string): Promise<number> {
    try {
      const [answerEmbedding, inputEmbedding] = await Promise.all([
        this.getEmbedding(answer),
        this.getEmbedding(userInput),
      ]);

      const cosineSimilarity = this.calculateCosineSimilarity(answerEmbedding, inputEmbedding);

      // 코사인 유사도 (-1 ~ 1)를 0-100% 스케일로 변환
      // 일반적으로 0.3 이상이면 관련성 있음, 0.7 이상이면 매우 유사
      const percentage = Math.max(0, Math.min(100, Math.round(cosineSimilarity * 100)));

      this.logger.log(`Semantic similarity between "${answer}" and "${userInput}": ${percentage}%`);

      return percentage;
    } catch (error) {
      this.logger.error(`Semantic similarity calculation failed:`, error);
      // OpenAI API 실패 시 철자 유사도로 폴백
      return this.fallbackToLevenshtein(answer, userInput);
    }
  }

  // 폴백: Levenshtein Distance 기반 유사도
  private fallbackToLevenshtein(answer: string, userInput: string): number {
    const levenshteinDistance = this.levenshteinDistance(
      answer.toLowerCase().trim(),
      userInput.toLowerCase().trim()
    );

    const maxLength = Math.max(answer.length, userInput.length);
    if (maxLength === 0) return 100;

    return Math.round((1 - levenshteinDistance / maxLength) * 100);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // 캐시 통계 (디버깅용)
  getCacheStats() {
    return {
      cacheSize: this.embeddingCache.size,
      cached: Array.from(this.embeddingCache.keys()),
    };
  }
}