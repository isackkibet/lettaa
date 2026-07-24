export declare enum AchievementId {
    FIRST_DELIVERY = "FIRST_DELIVERY",
    TEN_DELIVERIES = "TEN_DELIVERIES",
    NEVER_LATE = "NEVER_LATE",
    CUSTOMER_FAVORITE = "CUSTOMER_FAVORITE",
    ELITE_RIDER = "ELITE_RIDER"
}
export interface AchievementDefinition {
    id: AchievementId;
    title: string;
    description: string;
}
/**
 * The five achievements supported in this MVP. Unlock conditions live in
 * AchievementService, keyed off PlayerProgress fields.
 */
export declare const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, AchievementDefinition>;
