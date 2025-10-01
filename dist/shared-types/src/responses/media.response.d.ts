export declare class MediaResponse {
    media_id: number;
    uploader_profile_id: number;
    uploader_type: 'parent' | 'child';
    file_name: string;
    mime_type: string;
    file_size: number;
    s3_key: string;
    cdn_url: string;
    created_at: Date;
}
