import { LEVELS, LevelDefinition, MAX_LEVEL } from '@/constants/levels.constants';

export function getLevelForXp(totalXp: number): LevelDefinition {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (totalXp >= level.xpThreshold) {
      current = level;
    }
  }
  return current;
}

export function getNextLevel(currentLevel: number): LevelDefinition | null {
  if (currentLevel >= MAX_LEVEL) return null;
  return LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
}
