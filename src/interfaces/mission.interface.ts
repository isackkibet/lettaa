import { MissionId } from '@/constants/missions.constants';

export interface Mission {
  id: MissionId;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  xpReward: number;
  // Synced from letaa_gamification.quests (reward_coins/reward_gems/reward_tokens)
  coinReward: number;
  gemReward: number;
  tokenReward: number;
}

export interface MissionProgressResult {
  missions: Mission[];
  newlyCompleted: Mission[];
  xpAwarded: number;
}
