"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEEDBACK_TEMPLATES = void 0;
/**
 * Feedback message templates. `{n}` placeholders are interpolated by
 * FeedbackService. Kept separate from logic so copy can change independently.
 */
exports.FEEDBACK_TEMPLATES = {
    LEVEL_UP: 'Level up! You are now a {levelTitle}.',
    ACHIEVEMENT_UNLOCKED: 'Achievement unlocked: {achievementTitle}!',
    MISSION_COMPLETE: 'Mission complete: {missionTitle}. +{xp} XP.',
    MISSION_PROGRESS: '{progressNote} Complete {remaining} more {unit} to unlock {missionTitle}.',
    LATE_DELIVERY: 'That delivery was late. Stay sharp to protect your reputation.',
    NEXT_LEVEL_PROGRESS: '{xpRemaining} XP to reach {nextLevelTitle}.',
    MAX_LEVEL: "You've reached the top: {levelTitle}. Legendary work.",
    NOT_COMPLETED: 'No delivery to record — deliveryCompleted was false.',
    DEFAULT: 'Delivery recorded. Keep up the momentum.',
};
//# sourceMappingURL=feedback.constants.js.map