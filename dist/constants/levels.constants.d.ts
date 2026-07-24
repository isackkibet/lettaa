/**
 * Ten-level progression ladder, synced from `letaa_core.levels` seed data
 * (letaa_db.sql). Index corresponds to level number - 1. `xpThreshold` is
 * the minimum total XP required to be at that level (DB column: required_xp).
 */
export interface LevelDefinition {
    level: number;
    title: string;
    xpThreshold: number;
    rewardTokens: number;
    description: string;
}
export declare const LEVELS: LevelDefinition[];
export declare const MAX_LEVEL: number;
