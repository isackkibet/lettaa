import { PerformanceGrade } from '../types/rider.types';
/**
 * Shape of a persisted delivery feedback record, synced from
 * `letaa_gamification.feedback` (letaa_db.sql). `message` is the DB's
 * `feedback_message` column — FeedbackService currently returns that string
 * directly rather than this full record; the rest of the fields are here so
 * a caller can assemble a full row to persist once that wiring exists.
 */
export interface FeedbackResponse {
    message: string;
    performanceScore: number | null;
    performanceGrade: PerformanceGrade | null;
    improvementTip: string | null;
    rating: number | null;
    earnedXp: number;
}
