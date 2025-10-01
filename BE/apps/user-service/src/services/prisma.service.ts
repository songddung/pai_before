import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

// 동적 Prisma 클라이언트 로딩 (Docker 환경 호환성)
let PrismaClient: any;
try {
  PrismaClient = require('../../generated/client').PrismaClient;
} catch {
  try {
    PrismaClient = require('../generated/client').PrismaClient;
  } catch {
    try {
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
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
