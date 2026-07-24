/**
 * Five-level progression ladder. Index corresponds to level number - 1.
 * `xpThreshold` is the minimum total XP required to be at that level.
 */
export interface LevelDefinition {
    level: number;
    title: string;
    xpThreshold: number;
}
export declare const LEVELS: LevelDefinition[];
export declare const MAX_LEVEL: number;
