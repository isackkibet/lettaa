/**
 * Five-level progression ladder. Index corresponds to level number - 1.
 * `xpThreshold` is the minimum total XP required to be at that level.
 */
export interface LevelDefinition {
  level: number;
  title: string;
  xpThreshold: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, title: 'Rookie', xpThreshold: 0 },
  { level: 2, title: 'Courier', xpThreshold: 200 },
  { level: 3, title: 'Navigator', xpThreshold: 500 },
  { level: 4, title: 'Elite Rider', xpThreshold: 1000 },
  { level: 5, title: 'Avalanche Legend', xpThreshold: 2000 },
];

export const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;
