export declare enum AchievementId {
    FIRST_DELIVERY = "FIRST_DELIVERY",
    TEN_DELIVERIES = "TEN_DELIVERIES",
    NEVER_LATE = "NEVER_LATE",
    CUSTOMER_FAVORITE = "CUSTOMER_FAVORITE",
    ELITE_RIDER = "ELITE_RIDER"
}
/** Mirrors letaa_core.achievement_category. */
export type AchievementCategory = 'DELIVERY_MILESTONE' | 'SPEED' | 'CUSTOMER_SERVICE' | 'RELIABILITY' | 'SPECIAL_EVENT';
export interface AchievementDefinition {
    id: AchievementId;
    title: string;
    description: string;
    category: AchievementCategory;
    badgeIcon: string | null;
    xpReward: number;
    coinReward: number;
    tokenReward: number;
    targetValue: number;
}
/**
 * The five achievements supported in this MVP. Unlock conditions live in
 * AchievementService, keyed off Player fields.
 *
 * FIRST_DELIVERY, TEN_DELIVERIES, NEVER_LATE, and CUSTOMER_FAVORITE are
 * synced field-for-field (description/xpReward/coinReward/tokenReward/
 * targetValue) against the matching rows in `letaa_gamification.achievements`
 * (letaa_db.sql). ELITE_RIDER has no DB counterpart — the DB's level ladder
 * has no "Elite Rider" title (closest is level 7, "Elite Courier"), so its
 * condition/copy point at that level instead and its reward fields fall back
 * to the generic ACHIEVEMENT_UNLOCKED xp action value.
 */
export declare const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, AchievementDefinition>;
