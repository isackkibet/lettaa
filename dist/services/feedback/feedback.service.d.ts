import { Achievement, Mission } from '../../interfaces';
export interface FeedbackContext {
    levelUp: boolean;
    levelTitle: string;
    currentLevel: number;
    totalXp: number;
    wasLate: boolean;
    newlyUnlockedAchievements: Achievement[];
    newlyCompletedMissions: Mission[];
    missions: Mission[];
}
/**
 * Generates a single specific, actionable feedback message per delivery.
 * Priority: level up > achievement > mission completed > late-delivery
 * warning > closest-to-completion mission nudge > default.
 */
export declare class FeedbackService {
    generate(ctx: FeedbackContext): string;
    private buildClosestMissionNudge;
}
