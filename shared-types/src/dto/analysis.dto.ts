// shared-types/src/dto/analysis.dto.ts

export interface CreateAnalysisDto {
  conversation_id: string;
  child_id: string;
  category: string;
  extracted_keywords: string[];
}

export interface AnalysisQueryDto {
  child_id: string;
  limit?: number;
  from_date?: string;
  to_date?: string;
}

export interface RecommendationRequestDto {
  user_id: string;
  profile_id: string;
  category: string;
  keyword: string;
  lat: number;
  lon: number;
}

export interface GetReportQueryDto {
  child_id: string;
  report_type: 'daily' | 'weekly' | 'monthly';
}