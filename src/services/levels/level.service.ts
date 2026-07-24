import { getLevelForXp, getNextLevel } from '@/utils/level.utils';

export interface LevelCheckResult {
  level: number;
  levelTitle: string;
  levelUp: boolean;
}

/**
 * Determines the player's level from total XP and detects level-ups by
 * comparing against the level held before this delivery's XP was applied.
 */
export class LevelService {
  checkLevel(previousLevel: number, totalXp: number): LevelCheckResult {
    const current = getLevelForXp(totalXp);
    return {
      level: current.level,
      levelTitle: current.title,
      levelUp: current.level > previousLevel,
    };
  }

  getNextLevel(currentLevel: number) {
    return getNextLevel(currentLevel);
  }
}
