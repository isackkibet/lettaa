import { AchievementId } from '@/constants/achievements.constants';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}
