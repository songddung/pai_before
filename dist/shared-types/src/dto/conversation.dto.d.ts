export interface StartConversationDto {
    title?: string;
    initialImageS3Url?: string;
    questions: {
        questionText: string;
        answerText: string;
        vqaDirectAnswer?: string;
        questionOrder: number;
    }[];
}
