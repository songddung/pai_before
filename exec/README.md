# PAI 서비스 실행 가이드 (exec)

이 디렉터리는 PAI 서비스의 배포와 실행을 위한 문서들을 포함합니다.

## 📁 디렉터리 구조

```
exec/
├── README.md           # 이 파일
├── 포팅매뉴얼.md        # 상세한 포팅 매뉴얼
├── 시연시나리오.md      # 시연을 위한 시나리오
└── 배포가이드.md        # 간단한 배포 가이드
```

## 📋 문서 목록

### 1. [포팅매뉴얼.md](./포팅매뉴얼.md)

PAI 서비스의 완전한 포팅 매뉴얼입니다. 다음 내용을 포함합니다:

- 시스템 요구사항
- 설치 및 설정 방법
- 환경 변수 설정
- 데이터베이스 설정
- 배포 및 운영 가이드
- 트러블슈팅

### 2. [시연시나리오.md](./시연시나리오.md)

PAI 서비스의 주요 기능을 시연하기 위한 시나리오입니다.

### 3. [배포가이드.md](./배포가이드.md)

빠른 배포를 위한 간단한 가이드입니다.

## 🚀 빠른 시작

### 1. 개발 환경 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd PAI-S13P21C101

# 2. 환경 파일 설정
cp BE/apps/gateway/.env.example BE/apps/gateway/.env
cp BE/apps/user-service/.env.example BE/apps/user-service/.env
# 각 서비스별 .env 파일 설정

# 3. Docker Compose 실행
cd BE
docker-compose up -d
```

### 2. 모바일 앱 실행

```bash
# 프론트엔드 실행
cd FE
npm install
npx expo start
```

## 🔧 서비스 URL

### 개발 환경

- **API Gateway**: http://localhost:3006
- **Frontend**: Expo Go 앱을 통해 접근

### 프로덕션 환경

- **서비스 URL**: https://j13c101.p.ssafy.io
- **API 엔드포인트**: https://j13c101.p.ssafy.io/api
- **AI 서비스**: https://j13c101.p.ssafy.io/tts, https://j13c101.p.ssafy.io/vqa

## 📱 테스트 계정

### 부모 계정

- **이메일**: parent@test.com
- **비밀번호**: test123!
- **PIN**: 1234

### 자녀 계정

- **이메일**: child@test.com
- **비밀번호**: test123!

## 🏗️ 아키텍처 개요

```
📱 React Native App
        ↓ HTTPS
🌐 Traefik (Load Balancer)
        ↓
🚪 API Gateway (NestJS)
        ↓
┌─────────────────────────────────┐
│        Microservices            │
├─────────────────────────────────┤
│ 👤 User Service (인증/프로필)    │
│ 💬 Conversation Service (대화)  │
│ 🎯 Quiz Service (퀴즈)          │
│ 📁 Media Service (파일관리)     │
│ 🎨 ARK Service (관심사분석)     │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│         Data Layer              │
├─────────────────────────────────┤
│ 🗄️ PostgreSQL (메인 DB)        │
│ 🚀 Redis (캐시/세션)            │
└─────────────────────────────────┘

🤖 AI Service (Python FastAPI)
├─ TTS (Text-to-Speech)
└─ VQA (Visual Question Answering)
```

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. **포팅매뉴얼.md**의 트러블슈팅 섹션
2. 서비스 로그: `docker-compose logs -f`
3. 시스템 리소스: `docker stats`
