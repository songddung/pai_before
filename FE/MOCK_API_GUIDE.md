# Mock API 사용 가이드

FE 프로젝트에서 백엔드 API를 Mock 데이터로 교체하여 프론트엔드 화면만 테스트할 수 있도록 설정되었습니다.

## 📋 목차

1. [Mock API 활성화/비활성화](#mock-api-활성화비활성화)
2. [Mock 데이터 구조](#mock-데이터-구조)
3. [초기 Mock 데이터](#초기-mock-데이터)
4. [테스트 계정 정보](#테스트-계정-정보)
5. [주요 기능별 Mock 데이터](#주요-기능별-mock-데이터)
6. [Mock 데이터 수정하기](#mock-데이터-수정하기)

---

## Mock API 활성화/비활성화

### ✅ Mock API 켜기 (백엔드 없이 테스트)

`src/shared/api/mock/mockConfig.ts` 파일을 열고 다음과 같이 설정:

```typescript
export const MOCK_CONFIG = {
  USE_MOCK_API: true,  // ← true로 설정
  RESPONSE_DELAY: 500,
  ENABLE_LOGGING: true,
};
```

### ❌ Mock API 끄기 (실제 백엔드 사용)

```typescript
export const MOCK_CONFIG = {
  USE_MOCK_API: false,  // ← false로 설정
  RESPONSE_DELAY: 500,
  ENABLE_LOGGING: true,
};
```

### ⚙️ 추가 설정 옵션

- **RESPONSE_DELAY**: Mock API 응답 지연 시간 (밀리초)
  - 기본값: 500ms
  - 네트워크 지연을 시뮬레이션하여 로딩 상태 테스트 가능

- **ENABLE_LOGGING**: Mock API 호출 로그 출력 여부
  - `true`: 콘솔에 API 호출 로그 출력
  - `false`: 로그 출력 안 함

---

## Mock 데이터 구조

Mock API는 다음과 같은 도메인별로 구성되어 있습니다:

```
src/shared/api/mock/
├── mockConfig.ts         # Mock 설정 및 헬퍼 함수
├── userMock.ts           # User & Profile API Mock
├── conversationMock.ts   # Conversation API Mock
├── quizMock.ts           # Quiz API Mock
├── arkMock.ts            # ARK (분석/추천) API Mock
└── index.ts              # 통합 Export
```

---

## 초기 Mock 데이터

### 👤 사용자 (User)

- **이메일**: `test@example.com`
- **비밀번호**: `password123`
- **주소**: 서울특별시 강남구

### 👨‍👩‍👧‍👦 프로필 (Profiles)

1. **부모 프로필**
   - ID: 1
   - 이름: 송현광
   - 타입: PARENT
   - PIN: `1234`

2. **자녀 프로필 1**
   - ID: 2
   - 이름: 정유진
   - 생년월일: 2018-07-20
   - 성별: FEMALE

3. **자녀 프로필 2**
   - ID: 3
   - 이름: 김민규
   - 생년월일: 2020-05-10
   - 성별: MALE

---

## 테스트 계정 정보

### 🔐 로그인

```
이메일: test@example.com
비밀번호: password123
```

### 📌 부모 프로필 PIN

```
PIN: 1234
```

모든 부모 프로필 인증에서 이 PIN을 사용합니다.

---

## 주요 기능별 Mock 데이터

### 1️⃣ 대화 (Conversation)

#### 초기 대화 이미지 목록
- 우리 가족 여행 (2일 전)
- 내가 그린 그림 (5일 전)
- 강아지랑 놀기 (7일 전)
- 생일 파티 (10일 전)

#### AI 응답 패턴
Mock에서는 다음과 같은 응답을 랜덤하게 제공:
- "정말 재미있는 이야기네요! 더 자세히 들려주실래요?"
- "와, 대단해요! 그 다음엔 어떻게 됐나요?"
- "아주 멋진 생각이에요! 그것에 대해 더 알려주세요."
- 등등...

### 2️⃣ 퀴즈 (Quiz)

#### 오늘의 퀴즈 (자동 생성)
- "오늘 날씨가 어땠어?" - 정답: 맑았어요
- "유치원에서 제일 재미있었던 일은?" - 정답: 친구들이랑 놀이터에서 놀았어요

#### 채점 로직
- **70% 이상 유사도**: 정답 처리
- **50~69% 유사도**: "거의 다 왔어요!"
- **50% 미만**: 힌트 제공

#### 보상 시스템
각 퀴즈마다 보상 설정 가능 (예: 아이스크림, 스티커)

### 3️⃣ 관심사 분석 (ARK)

#### 초기 분석 데이터

**정유진 (자녀1)**
- 동물 (강아지, 고양이, 토끼) - 85점
- 예술 (그림, 색칠, 만들기) - 90점
- 음식 (케이크, 초콜릿, 과일) - 78점

**김민규 (자녀2)**
- 동물 (강아지, 산책, 놀이) - 92점

#### 추천 축제 데이터
카테고리별로 적합한 축제 추천:
- **동물**: 서울 어린이 동물원, 반려동물 박람회
- **예술**: 어린이 미술관 특별전
- **음식**: 키즈 쿠킹 클래스 페스티벌

---

## Mock 데이터 수정하기

### ✏️ 사용자 추가

`src/shared/api/mock/userMock.ts` 파일의 `INITIAL_USER` 수정:

```typescript
const INITIAL_USER = {
  userId: 'user-001',
  email: 'your-email@example.com',  // ← 변경
  password: 'your-password',         // ← 변경
  address: '원하는 주소',
  // ...
};
```

### 👶 프로필 추가

`src/shared/api/mock/userMock.ts` 파일의 `INITIAL_PROFILES` 배열에 추가:

```typescript
const INITIAL_PROFILES: ProfileResponse[] = [
  // 기존 프로필들...
  {
    profile_id: 4,
    user_id: 'user-001',
    profile_type: 'CHILD',
    name: '새로운 아이',
    birth_date: '2019-03-15',
    gender: 'MALE',
    avatar_media_id: 'avatar-004',
    created_at: new Date().toISOString(),
  },
];
```

### 📝 퀴즈 추가

`src/shared/api/mock/quizMock.ts` 파일의 `INITIAL_QUIZZES` 배열에 추가:

```typescript
const INITIAL_QUIZZES: MockQuiz[] = [
  // 기존 퀴즈들...
  {
    id: 'quiz-004',
    parentId: '1',
    question: '새로운 질문?',
    answer: '예상 답변',
    reward: '보상 이름',
    quizDate: new Date().toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
```

### 🎨 관심사 분석 데이터 추가

`src/shared/api/mock/arkMock.ts` 파일의 `INITIAL_ANALYSES` 배열에 추가:

```typescript
const INITIAL_ANALYSES: MockAnalysis[] = [
  // 기존 분석들...
  {
    child_id: '2',
    conversation_id: 'conv-005',
    category: '스포츠',
    extracted_keywords: ['축구', '농구', '달리기'],
    score: 88,
    analysis_date: new Date().toISOString(),
  },
];
```

### 🎪 추천 축제 추가

`src/shared/api/mock/arkMock.ts` 파일의 `MOCK_FESTIVALS` 배열에 추가:

```typescript
const MOCK_FESTIVALS: MockFestival[] = [
  // 기존 축제들...
  {
    title: '새로운 축제 이름',
    address: '서울특별시 OO구 OO로 123',
    lat: 37.5000,
    lon: 127.0000,
    distance_km: 2.5,
    first_image: 'https://picsum.photos/400/300?random=14',
    tel: '02-123-4567',
  },
];
```

---

## 🔍 디버깅 팁

### 콘솔 로그 확인

Mock API 사용 시 콘솔에 다음과 같은 로그가 출력됩니다:

```
[MOCK API] POST userApi.login { email: 'test@example.com' }
[MOCK API] GET profileApi.getAllProfiles
[MOCK API] POST conversationApi.startConversation {...}
```

### Mock/Real API 전환 테스트

1. Mock으로 화면이 정상 작동하는지 확인
2. `USE_MOCK_API: false`로 변경
3. 실제 백엔드와 연결하여 동일하게 작동하는지 확인

---

## 📌 주의사항

1. **토큰 검증**: Mock에서는 간단한 토큰 형식(`mock.token.xxx`)을 사용합니다.
2. **데이터 영속성**: Mock 데이터는 앱 재시작 시 초기화됩니다.
3. **이미지 URL**: Mock에서는 `picsum.photos`의 랜덤 이미지를 사용합니다.
4. **음성 기능**: Mock에서는 실제 음성 처리를 하지 않고 성공 응답만 반환합니다.

---

## 🚀 빠른 시작

1. `src/shared/api/mock/mockConfig.ts`에서 `USE_MOCK_API: true` 설정
2. 앱 재시작
3. 로그인: `test@example.com` / `password123`
4. 프로필 선택 (부모 선택 시 PIN: `1234`)
5. 모든 기능 테스트 가능!

---

## 💡 문제 해결

### Q: Mock API가 작동하지 않아요
A: `mockConfig.ts`의 `USE_MOCK_API`가 `true`로 설정되어 있는지 확인하고, 앱을 재시작해보세요.

### Q: 로그인이 안 돼요
A: 이메일 `test@example.com`과 비밀번호 `password123`를 정확히 입력했는지 확인하세요.

### Q: PIN이 틀렸다고 나와요
A: Mock에서 부모 프로필 PIN은 항상 `1234`입니다.

### Q: 퀴즈가 안 보여요
A: `quizMock.ts`의 퀴즈 데이터의 `quizDate`가 오늘 날짜인지 확인하세요.

---

## 🔗 관련 파일

- Mock 설정: [src/shared/api/mock/mockConfig.ts](src/shared/api/mock/mockConfig.ts)
- User Mock: [src/shared/api/mock/userMock.ts](src/shared/api/mock/userMock.ts)
- Conversation Mock: [src/shared/api/mock/conversationMock.ts](src/shared/api/mock/conversationMock.ts)
- Quiz Mock: [src/shared/api/mock/quizMock.ts](src/shared/api/mock/quizMock.ts)
- ARK Mock: [src/shared/api/mock/arkMock.ts](src/shared/api/mock/arkMock.ts)

---

Happy Testing! 🎉
