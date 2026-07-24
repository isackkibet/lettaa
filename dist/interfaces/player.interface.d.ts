import { AccountStatus, PerformanceGrade, RiderRole } from '../types/rider.types';
/**
 * Snapshot of a player's persisted state, backed by `letaa_core.riders`
 * joined with `letaa_core.users` (see letaa_db.sql). Field names mirror the
 * DB columns (camelCased) so mapping a row onto this shape is a straight
 * rename. The engine only reads/derives from this — it never writes to a
 * database itself.
 */
export interface Player {
    id: string;
    walletAddress: string;
    xp: number;
    level: number;
    totalDeliveries: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    fiveStarRatings: number;
    totalRatedDeliveries: number;
    currentStreak: number;
    dailyMissionProgress: DailyMissionProgress;
    unlockedAchievementIds: string[];
    coins: number;
    gems: number;
    tokens: number;
    riderRole: RiderRole;
    performanceGrade: PerformanceGrade;
    reputationScore: number;
    status: AccountStatus;
    successfulDeliveries: number;
    failedDeliveries: number;
    acceptanceRate: number;
    completionRate: number;
    ontimeRate: number;
    avgDeliveryTime: number;
    avgCustomerRating: number;
    totalDistanceKm: number;
    totalActiveHours: number;
    longestStreak: number;
    weeklyRank: number | null;
    monthlyRank: number | null;
    lifetimeRank: number | null;
    totalRewardsEarned: number;
    totalBadges: number;
    totalNfts: number;
    totalCoinsEarned: number;
    totalCoinsRedeemed: number;
    totalTokensEarned: number;
}
/**
 * Per-mission progress counters for the current day. Reset by the persistence
 * layer at day rollover (TODO for Backend Developer 2) — the engine assumes
 * whatever is passed in already reflects "today".
 */
export interface DailyMissionProgress {
    deliveriesToday: number;
    onTimeDeliveriesToday: number;
    lateDeliveriesToday: number;
    fiveStarRatingsToday: number;
    completedMissionIds: string[];
}
