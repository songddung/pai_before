import { createApiClient, SERVICE_URLS, handleApiResponse } from '../../../shared/api/client';

// ARK 서비스 전용 API 클라이언트
const arkApiClient = createApiClient(SERVICE_URLS.ARK);

// 백엔드 타입에 맞춰 수정
interface CreateAnalysisRequest {
  conversation_id: string;
  child_id: string;
  category: string;
  extracted_keywords: string[];
}

interface AnalysisQueryParams {
  child_id: string;
  limit?: number;
  from_date?: string;
  to_date?: string;
}

interface AnalysisResponse {
  child_id: string;
  extracted_keywords: string[];
  category: string | null;
  score?: number | null;
  analysis_date: string;
}

interface FestivalData {
  title: string;
  address: string;
  lat: number;
  lon: number;
  distance_km: number;
  first_image: string;
  tel: string;
}

interface RecommendationResponse {
  user_id: string;
  profile_id: string;
  translated_category: string;
  translated_keyword: string;
  festivals: FestivalData[];
}

interface ReportQueryParams {
  child_id: string;
  report_type: 'daily' | 'weekly' | 'monthly';
}

interface ReportResponse {
  child_id: string;
  report_type: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  bubble_chart_data: Record<string, number>;
}

export const arkApi = {
  // 관심사 분석 생성 (대화 종료 시 자동 호출)
  async createAnalysis(data: CreateAnalysisRequest) {
    console.log('관심사 분석 생성 API 호출:', data);
    const response = await arkApiClient.post('/api/ark/analysis', data);
    return handleApiResponse(response);
  },

  // 관심사 분석 조회 (부모 전용)
  async getAnalysis(params: AnalysisQueryParams): Promise<AnalysisResponse[]> {
    console.log('관심사 분석 조회 API 호출:', params);

    const queryParams = new URLSearchParams();
    queryParams.append('child_id', params.child_id);

    // limit은 숫자로 처리
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    if (params.from_date) {
      queryParams.append('from_date', params.from_date);
    }

    if (params.to_date) {
      queryParams.append('to_date', params.to_date);
    }

    const url = `/api/ark/analysis?${queryParams}`;
    console.log('최종 요청 URL:', url);
    console.log('Query Parameters:', queryParams.toString());

    try {
      const response = await arkApiClient.get(url);
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 데이터:', response.data);
      return handleApiResponse<AnalysisResponse[]>(response);
    } catch (error: any) {
      console.error('arkApi.getAnalysis 호출 실패:', {
        url,
        params,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          baseURL: arkApiClient.defaults.baseURL,
          headers: error.config?.headers,
        }
      });
      throw error;
    }
  },

  // 아이 관심사 기반 추천 조회 (부모 전용)
  async getRecommendations(childId: string): Promise<RecommendationResponse> {
    console.log('추천 조회 API 호출:', { childId });

    const queryParams = new URLSearchParams({
      child_id: childId,
    });

    const url = `/api/ark/recommend?${queryParams}`;
    console.log('추천 API 요청 URL:', url);

    try {
      const response = await arkApiClient.get(url);
      console.log('추천 API 응답 상태:', response.status);
      console.log('추천 API 응답 데이터:', response.data);
      return handleApiResponse<RecommendationResponse>(response);
    } catch (error: any) {
      console.error('arkApi.getRecommendations 호출 실패:', {
        url,
        childId,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          baseURL: arkApiClient.defaults.baseURL,
          headers: error.config?.headers,
        }
      });
      throw error;
    }
  },

  // 분석 리포트 조회 (부모 전용)
  async getReports(params: ReportQueryParams): Promise<ReportResponse> {
    console.log('리포트 조회 API 호출:', params);

    const queryParams = new URLSearchParams({
      child_id: params.child_id,
      report_type: params.report_type,
    });

    const response = await arkApiClient.get(`/api/ark/reports?${queryParams}`);
    return handleApiResponse<ReportResponse>(response);
  },
};