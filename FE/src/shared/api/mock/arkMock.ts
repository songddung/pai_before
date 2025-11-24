import { delay, mockLog } from './mockConfig';

// Mock ARK 분석 데이터 구조
interface MockAnalysis {
  child_id: string;
  conversation_id: string;
  category: string | null;
  extracted_keywords: string[];
  score: number | null;
  analysis_date: string;
}

interface MockFestival {
  title: string;
  address: string;
  lat: number;
  lon: number;
  distance_km: number;
  first_image: string;
  tel: string;
}

// Mock 데이터 저장소
const mockAnalyses: MockAnalysis[] = [];

// 초기 Mock 분석 데이터
const INITIAL_ANALYSES: MockAnalysis[] = [
  {
    child_id: '2',
    conversation_id: 'conv-001',
    category: '동물',
    extracted_keywords: ['강아지', '고양이', '토끼'],
    score: 85,
    analysis_date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    child_id: '2',
    conversation_id: 'conv-002',
    category: '예술',
    extracted_keywords: ['그림', '색칠', '만들기'],
    score: 90,
    analysis_date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    child_id: '2',
    conversation_id: 'conv-004',
    category: '음식',
    extracted_keywords: ['케이크', '초콜릿', '과일'],
    score: 78,
    analysis_date: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    child_id: '3',
    conversation_id: 'conv-003',
    category: '동물',
    extracted_keywords: ['강아지', '산책', '놀이'],
    score: 92,
    analysis_date: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// 초기 데이터 세팅
mockAnalyses.push(...INITIAL_ANALYSES);

// Mock 축제 데이터
const MOCK_FESTIVALS: MockFestival[] = [
  {
    title: '서울 어린이 동물원 체험전',
    address: '서울특별시 광진구 능동로 216',
    lat: 37.5478,
    lon: 127.0781,
    distance_km: 5.2,
    first_image: 'https://picsum.photos/400/300?random=10',
    tel: '02-450-9311',
  },
  {
    title: '어린이 미술관 특별전',
    address: '서울특별시 종로구 대학로 8길 102',
    lat: 37.5823,
    lon: 127.0027,
    distance_km: 8.7,
    first_image: 'https://picsum.photos/400/300?random=11',
    tel: '02-760-4850',
  },
  {
    title: '키즈 쿠킹 클래스 페스티벌',
    address: '서울특별시 강남구 테헤란로 152',
    lat: 37.5048,
    lon: 127.0500,
    distance_km: 3.8,
    first_image: 'https://picsum.photos/400/300?random=12',
    tel: '02-6014-2346',
  },
  {
    title: '반려동물 체험 박람회',
    address: '서울특별시 강남구 삼성로 837',
    lat: 37.5130,
    lon: 127.0595,
    distance_km: 4.5,
    first_image: 'https://picsum.photos/400/300?random=13',
    tel: '02-551-0114',
  },
];

// 카테고리별 추천 매핑
const CATEGORY_FESTIVAL_MAP: Record<string, number[]> = {
  동물: [0, 3], // 동물원, 반려동물 박람회
  예술: [1], // 미술관
  음식: [2], // 쿠킹 클래스
  기타: [0, 1, 2, 3], // 모든 축제
};

/**
 * ARK API Mock 함수들
 */
export const arkMockApi = {
  // 관심사 분석 생성
  async createAnalysis(data: {
    conversation_id: string;
    child_id: string;
    category: string;
    extracted_keywords: string[];
  }): Promise<MockAnalysis> {
    await delay();
    mockLog('arkApi.createAnalysis', 'POST', data);

    const newAnalysis: MockAnalysis = {
      child_id: data.child_id,
      conversation_id: data.conversation_id,
      category: data.category,
      extracted_keywords: data.extracted_keywords,
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      analysis_date: new Date().toISOString(),
    };

    mockAnalyses.push(newAnalysis);
    return newAnalysis;
  },

  // 관심사 분석 조회
  async getAnalysis(params: {
    child_id: string;
    limit?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<
    {
      child_id: string;
      extracted_keywords: string[];
      category: string | null;
      score: number | null;
      analysis_date: string;
    }[]
  > {
    await delay();
    mockLog('arkApi.getAnalysis', 'GET', params);

    // child_id로 필터링
    let filtered = mockAnalyses.filter(
      analysis => analysis.child_id === params.child_id,
    );

    // 날짜 범위 필터링
    if (params.from_date) {
      const fromDate = new Date(params.from_date);
      filtered = filtered.filter(
        analysis => new Date(analysis.analysis_date) >= fromDate,
      );
    }

    if (params.to_date) {
      const toDate = new Date(params.to_date);
      filtered = filtered.filter(
        analysis => new Date(analysis.analysis_date) <= toDate,
      );
    }

    // 최신순 정렬
    filtered.sort(
      (a, b) =>
        new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime(),
    );

    // limit 적용
    if (params.limit && params.limit > 0) {
      filtered = filtered.slice(0, params.limit);
    }

    // conversation_id 제외하고 반환
    return filtered.map(({ conversation_id, ...rest }) => rest);
  },

  // 아이 관심사 기반 추천 조회
  async getRecommendations(childId: string): Promise<{
    user_id: string;
    profile_id: string;
    translated_category: string;
    translated_keyword: string;
    festivals: MockFestival[];
  }> {
    await delay();
    mockLog('arkApi.getRecommendations', 'GET', { childId });

    // 해당 아이의 최근 분석 조회
    const childAnalyses = mockAnalyses
      .filter(analysis => analysis.child_id === childId)
      .sort(
        (a, b) =>
          new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime(),
      );

    if (childAnalyses.length === 0) {
      // 분석이 없으면 기본 추천
      return {
        user_id: 'user-001',
        profile_id: childId,
        translated_category: '일반',
        translated_keyword: '가족 체험',
        festivals: MOCK_FESTIVALS.slice(0, 2),
      };
    }

    // 가장 최근 분석 기반 추천
    const latestAnalysis = childAnalyses[0];
    const category = latestAnalysis.category || '기타';
    const keyword =
      latestAnalysis.extracted_keywords[0] || '체험';

    // 카테고리에 맞는 축제 선택
    const festivalIndices = CATEGORY_FESTIVAL_MAP[category] || CATEGORY_FESTIVAL_MAP['기타'];
    const recommendedFestivals = festivalIndices.map(
      index => MOCK_FESTIVALS[index],
    );

    return {
      user_id: 'user-001',
      profile_id: childId,
      translated_category: category,
      translated_keyword: keyword,
      festivals: recommendedFestivals,
    };
  },

  // 분석 리포트 조회
  async getReports(params: {
    child_id: string;
    report_type: 'daily' | 'weekly' | 'monthly';
  }): Promise<{
    child_id: string;
    report_type: string;
    date_range: {
      start_date: string;
      end_date: string;
    };
    bubble_chart_data: Record<string, number>;
  }> {
    await delay();
    mockLog('arkApi.getReports', 'GET', params);

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // 리포트 타입에 따른 날짜 범위 설정
    switch (params.report_type) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // 해당 기간의 분석 데이터 필터링
    const filtered = mockAnalyses.filter(analysis => {
      if (analysis.child_id !== params.child_id) return false;
      const analysisDate = new Date(analysis.analysis_date);
      return analysisDate >= startDate && analysisDate <= endDate;
    });

    // 카테고리별로 집계
    const bubbleData: Record<string, number> = {};
    filtered.forEach(analysis => {
      const category = analysis.category || '기타';
      bubbleData[category] = (bubbleData[category] || 0) + 1;
    });

    // 키워드별로도 집계 (상위 5개)
    const keywordCount: Record<string, number> = {};
    filtered.forEach(analysis => {
      analysis.extracted_keywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    // 상위 5개 키워드를 bubbleData에 추가
    const topKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    topKeywords.forEach(([keyword, count]) => {
      bubbleData[keyword] = count;
    });

    return {
      child_id: params.child_id,
      report_type: params.report_type,
      date_range: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      bubble_chart_data: bubbleData,
    };
  },
};
