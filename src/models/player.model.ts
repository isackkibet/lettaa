import { Player, DailyMissionProgress } from '@/interfaces';

/**
 * Stateless default used when the caller doesn't have a persisted player yet
 * (e.g. first request, or local testing without a database).
 * TODO(Backend Developer 2): replace calls to this with a Supabase fetch by
 * player id. This factory should only remain as a fallback/test fixture.
 */
export function createDefaultDailyMissionProgress(): DailyMissionProgress {
  return {
    deliveriesToday: 0,
    onTimeDeliveriesToday: 0,
    lateDeliveriesToday: 0,
    fiveStarRatingsToday: 0,
    completedMissionIds: [],
  };
}

export function createDefaultPlayer(id = 'anonymous'): Player {
  return {
    id,
    totalXp: 0,
    level: 1,
    deliveriesCompleted: 0,
    onTimeDeliveries: 0,
    lateDeliveries: 0,
    fiveStarRatings: 0,
    totalRatedDeliveries: 0,
    currentOnTimeStreak: 0,
    dailyMissionProgress: createDefaultDailyMissionProgress(),
    unlockedAchievementIds: [],
  };
}
