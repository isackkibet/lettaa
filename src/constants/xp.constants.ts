/**
 * XP awarded/deducted per game event. Keep all XP magic numbers here.
 */
export const XP_RULES = {
  COMPLETE_DELIVERY: 50,
  ON_TIME_DELIVERY: 20,
  FIVE_STAR_RATING: 30,
  COMPLETE_DAILY_MISSION: 100,
  LATE_DELIVERY: -20,
} as const;
