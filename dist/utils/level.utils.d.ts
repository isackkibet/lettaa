import { LevelDefinition } from '../constants/levels.constants';
export declare function getLevelForXp(totalXp: number): LevelDefinition;
export declare function getNextLevel(currentLevel: number): LevelDefinition | null;
