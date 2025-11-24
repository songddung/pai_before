/**
 * Mock API 설정
 *
 * 이 파일에서 USE_MOCK_API를 true로 설정하면
 * 실제 백엔드 대신 mock 데이터를 사용합니다.
 */

export const MOCK_CONFIG = {
  // true로 설정하면 mock 데이터 사용
  USE_MOCK_API: true,

  // mock API 응답 지연 시간 (밀리초)
  RESPONSE_DELAY: 500,

  // 로그 출력 여부 (false로 설정하면 완전히 조용함)
  ENABLE_LOGGING: false,
};

/**
 * mock API 응답 지연을 시뮬레이션하는 헬퍼 함수
 */
export const delay = (ms: number = MOCK_CONFIG.RESPONSE_DELAY) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * mock API 로그 출력 헬퍼 함수
 */
export const mockLog = (apiName: string, method: string, data?: any) => {
  if (MOCK_CONFIG.ENABLE_LOGGING) {
    console.log(`[MOCK API] ${method} ${apiName}`, data || '');
  }
};
