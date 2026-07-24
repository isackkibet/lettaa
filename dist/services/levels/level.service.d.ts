export interface LevelCheckResult {
    level: number;
    levelTitle: string;
    levelUp: boolean;
}
/**
 * Determines the player's level from total XP and detects level-ups by
 * comparing against the level held before this delivery's XP was applied.
 */
export declare class LevelService {
    checkLevel(previousLevel: number, totalXp: number): LevelCheckResult;
    getNextLevel(currentLevel: number): import("../../constants/levels.constants").LevelDefinition | null;
}
