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
}
/**
 * The three daily missions supported in this MVP. `target` is the progress
 * count required to complete the mission; progress semantics are mission-specific
 * and interpreted by MissionService.
 */
export declare const MISSION_DEFINITIONS: Record<MissionId, MissionDefinition>;
