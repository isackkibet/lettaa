/**
 * Feedback message templates. `{n}` placeholders are interpolated by
 * FeedbackService. Kept separate from logic so copy can change independently.
 */
export declare const FEEDBACK_TEMPLATES: {
    readonly LEVEL_UP: "Level up! You are now a {levelTitle}.";
    readonly ACHIEVEMENT_UNLOCKED: "Achievement unlocked: {achievementTitle}!";
    readonly MISSION_COMPLETE: "Mission complete: {missionTitle}. +{xp} XP.";
    readonly MISSION_PROGRESS: "{progressNote} Complete {remaining} more {unit} to unlock {missionTitle}.";
    readonly LATE_DELIVERY: "That delivery was late. Stay sharp to protect your reputation.";
    readonly NEXT_LEVEL_PROGRESS: "{xpRemaining} XP to reach {nextLevelTitle}.";
    readonly MAX_LEVEL: "You've reached the top: {levelTitle}. Legendary work.";
    readonly NOT_COMPLETED: "No delivery to record — deliveryCompleted was false.";
    readonly DEFAULT: "Delivery recorded. Keep up the momentum.";
};
