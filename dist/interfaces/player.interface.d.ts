/**
 * Snapshot of a player's persisted state, as owned by Backend Developer 2's
 * database layer. The engine only reads/derives from this — it never writes
 * to a database itself.
 */
export interface Player {
    id: string;
    totalXp: number;
    level: number;
    deliveriesCompleted: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    fiveStarRatings: number;
    totalRatedDeliveries: number;
    currentOnTimeStreak: number;
    dailyMissionProgress: DailyMissionProgress;
    unlockedAchievementIds: string[];
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
