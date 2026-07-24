export declare enum MissionId {
    FIVE_DELIVERIES = "FIVE_DELIVERIES",
    PERFECT_ON_TIME = "PERFECT_ON_TIME",
    TWO_FIVE_STAR_RATINGS = "TWO_FIVE_STAR_RATINGS"
}
export interface MissionDefinition {
    id: MissionId;
    title: string;
    description: string;
    target: number;
    xpReward: number;
    coinReward: number;
    gemReward: number;
    tokenReward: number;
}
/**
 * The three daily missions supported in this MVP. `target` is the progress
 * count required to complete the mission; progress semantics are mission-specific
 * and interpreted by MissionService.
 *
 * `letaa_gamification.quests` (letaa_db.sql) is the DB equivalent ("quests"
 * there, "missions" here — same concept, different name in each layer).
 * FIVE_DELIVERIES has an exact target match with the DB's "Complete 5
 * Deliveries" DAILY quest, so its xpReward/coinReward/tokenReward are synced
 * to that row. PERFECT_ON_TIME and TWO_FIVE_STAR_RATINGS don't have a
 * same-target DB quest to sync against (DB's closest analogues use different
 * targets: "On-Time Delivery" target=1, "Three 5-Star Reviews" target=3), so
 * their reward fields stay engine-only defaults for now.
 */
export declare const MISSION_DEFINITIONS: Record<MissionId, MissionDefinition>;
