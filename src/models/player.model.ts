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

/**
 * Defaults mirror the column defaults in `letaa_core.riders`/`users`
 * (letaa_db.sql) so a fresh in-memory player matches what a freshly
 * inserted DB row would look like.
 */
export function createDefaultPlayer(id = 'anonymous'): Player {
  return {
    id,
    walletAddress: '',
    xp: 0,
    level: 1,
    totalDeliveries: 0,
    onTimeDeliveries: 0,
    lateDeliveries: 0,
    fiveStarRatings: 0,
    totalRatedDeliveries: 0,
    currentStreak: 0,
    dailyMissionProgress: createDefaultDailyMissionProgress(),
    unlockedAchievementIds: [],
    coins: 0,
    gems: 0,
    tokens: 0,
    riderRole: 'NEW_RIDER',
    performanceGrade: 'D',
    reputationScore: 0,
    status: 'ACTIVE',
    successfulDeliveries: 0,
    failedDeliveries: 0,
    acceptanceRate: 0,
    completionRate: 0,
    ontimeRate: 0,
    avgDeliveryTime: 0,
    avgCustomerRating: 0,
    totalDistanceKm: 0,
    totalActiveHours: 0,
    longestStreak: 0,
    weeklyRank: null,
    monthlyRank: null,
    lifetimeRank: null,
    totalRewardsEarned: 0,
    totalBadges: 0,
    totalNfts: 0,
    totalCoinsEarned: 0,
    totalCoinsRedeemed: 0,
    totalTokensEarned: 0,
  };
}
