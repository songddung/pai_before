export interface AnalysisResponseDto {
    child_id: string;
    extracted_keywords: string[];
    category: string | null;
    score: number | null;
    analysis_date: string;
}
export interface FestivalDto {
    title: string;
    address: string;
    lat: number;
    lon: number;
    distance_km: number;
    first_image: string;
    tel: string;
}
export interface RecommendationResponseDto {
    user_id: string;
    profile_id: string;
    translated_category: string;
    translated_keyword: string;
    festivals: FestivalDto[];
}
export interface RecommendationSummaryDto {
    title: string;
    type: string;
    description?: string;
}
export interface GalleryItemDto {
    conversation_id: string;
    image_url?: string;
    keywords: string[];
    category: string;
    analysis_date: string;
}
export interface ReportResponseDto {
    child_id: string;
    report_type: string;
    date_range: {
        start_date: string;
        end_date: string;
    };
    bubble_chart_data: Record<string, number>;
}
