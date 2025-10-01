import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Docker와 로컬 환경 모두 지원하는 동적 import
let PrismaClient: any;
try {
  // 로컬 개발 환경
  PrismaClient = require('../../generated/client').PrismaClient;
} catch {
  try {
    // Docker 환경 - 루트에서 접근
    PrismaClient = require('../generated/client').PrismaClient;
  } catch {
    try {
      // Docker 환경 - 현재 디렉토리에서 접근
      PrismaClient = require('./generated/client').PrismaClient;
    } catch {
      throw new Error('Prisma client not found. Please run: npx prisma generate');
    }
  }
}
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      console.log('Connecting to database...');
      await this.$connect();
      console.log('✅ Database connected successfully!');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
