# ----------------------
# 1. Dependencies 설치
# ----------------------
FROM node:20-slim AS deps
WORKDIR /workspace

# 루트 / BE package.json만 복사
COPY package*.json nx.json tsconfig.base.json ./
COPY BE/package*.json ./BE/
COPY BE/apps/gateway/package*.json ./BE/apps/gateway/

# 루트 의존성 설치
RUN npm ci
RUN cd BE && npm install

# ----------------------
# 2. Build 단계
# ----------------------
FROM node:20-slim AS builder
WORKDIR /workspace

# deps 단계에서 설치한 node_modules 재사용
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/BE/node_modules ./BE/node_modules

# gateway 소스만 복사
COPY BE/apps/gateway ./BE/apps/gateway

# NestJS 빌드 (gateway만)
RUN npm install -g @nestjs/cli
RUN cd BE/apps/gateway && nest build

# ----------------------
# 3. Production deps
# ----------------------
FROM node:20-slim AS prod-deps
WORKDIR /workspace

# 필요한 package.json만 복사
COPY package*.json nx.json tsconfig.base.json ./
COPY BE/package*.json ./BE/
COPY BE/apps/gateway/package*.json ./BE/apps/gateway/

# 프로덕션 의존성 설치
RUN npm ci --omit=dev
RUN cd BE && npm ci --omit=dev

# ----------------------
# 4. Runner
# ----------------------
FROM node:20-slim AS runner
ENV NODE_ENV=production
ARG PORT=3006
ENV PORT=${PORT}

RUN useradd -m -u 10001 appuser
WORKDIR /app

# gateway 실행에 필요한 node_modules만 복사
COPY --from=prod-deps /workspace/BE/node_modules ./node_modules

# gateway 빌드 산출물만 복사
COPY --from=builder /workspace/BE/apps/gateway/dist/ ./

EXPOSE ${PORT}
USER appuser
CMD ["node", "main.js"]
