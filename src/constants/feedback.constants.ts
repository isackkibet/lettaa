/**
 * Feedback message templates. `{n}` placeholders are interpolated by
 * FeedbackService. Kept separate from logic so copy can change independently.
 */
export const FEEDBACK_TEMPLATES = {
  LEVEL_UP: 'Level up! You are now a {levelTitle}.',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked: {achievementTitle}!',
  MISSION_COMPLETE: 'Mission complete: {missionTitle}. +{xp} XP.',
  MISSION_PROGRESS: '{progressNote} Complete {remaining} more {unit} to unlock {missionTitle}.',
  LATE_DELIVERY: 'That delivery was late. Stay sharp to protect your reputation.',
  NEXT_LEVEL_PROGRESS: '{xpRemaining} XP to reach {nextLevelTitle}.',
  MAX_LEVEL: "You've reached the top: {levelTitle}. Legendary work.",
  NOT_COMPLETED: 'No delivery to record — deliveryCompleted was false.',
  DEFAULT: 'Delivery recorded. Keep up the momentum.',
} as const;
