import { Mission } from './mission.interface';
import { Achievement } from './achievement.interface';

/**
 * The full result of running one delivery event through the game loop.
 * This is the shape the controller serializes into the API response.
 */
export interface PlayerProgress {
  xpEarned: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  levelUp: boolean;
  achievementsUnlocked: Achievement[];
  missions: Mission[];
  missionProgress: {
    completed: number;
    target: number;
  };
  reputation: number;
  rewardEligible: boolean;
  feedback: string;
}
