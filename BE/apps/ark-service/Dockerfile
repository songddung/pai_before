# ===== 아크 서비스 Dockerfile =====
FROM node:20-slim AS deps
WORKDIR /workspace

# 필요한 package.json들 복사
COPY package*.json nx.json tsconfig.base.json ./
COPY BE/package*.json ./BE/
COPY BE/apps/ark-service/package*.json ./BE/apps/ark-service/

# shared-types 미리 빌드된 것 복사
COPY dist/shared-types ./dist/shared-types

# 의존성 설치
RUN npm ci
RUN cd BE && npm install

# ===== 빌드 단계 =====
FROM node:20-slim AS builder
WORKDIR /workspace

# deps에서 복사
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/BE/node_modules ./BE/node_modules
COPY --from=deps /workspace/dist/shared-types ./dist/shared-types

# 소스 코드 복사
COPY BE/apps/ark-service ./BE/apps/ark-service

# 빌드 도구 설치 및 빌드
RUN npm install -g @nestjs/cli
RUN cd BE/apps/ark-service && npx prisma generate
RUN cd BE/apps/ark-service && nest build

# ===== 프로덕션 의존성 =====
FROM node:20-slim AS prod-deps
WORKDIR /workspace

COPY package*.json nx.json tsconfig.base.json ./
COPY BE/package*.json ./BE/
COPY BE/apps/ark-service/package*.json ./BE/apps/ark-service/

RUN npm ci --omit=dev
RUN cd BE && npm ci --omit=dev

# ===== 실행 단계 =====
FROM node:20-slim AS runner
ENV NODE_ENV=production
ARG PORT=3003
ENV PORT=${PORT}

# OpenSSL 3.0 호환성을 위한 라이브러리 설치
RUN apt-get update && \
    apt-get install -y libssl3 openssl && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 10001 appuser
WORKDIR /app

# 필요한 파일들 복사
COPY --from=prod-deps /workspace/BE/node_modules ./node_modules
COPY --from=builder /workspace/BE/apps/ark-service/dist/ ./
COPY --from=builder /workspace/BE/apps/ark-service/generated ./generated
COPY --from=builder /workspace/BE/apps/ark-service/prisma ./prisma
COPY --from=builder /workspace/dist/shared-types ./dist/shared-types

# TypeScript 컴파일된 경로와 실제 경로 연결을 위한 심볼링크 생성
RUN mkdir -p ../../../../dist && ln -sf /app/dist/shared-types ../../../../dist/shared-types

# appuser에게 필요한 권한 부여
RUN chown -R appuser:appuser /app

EXPOSE ${PORT}
USER appuser
CMD ["node", "main.js"]