import { AchievementCategory, AchievementId } from '../constants/achievements.constants';
export interface Achievement {
    id: AchievementId;
    title: string;
    description: string;
    earned: boolean;
    earnedAt: string | null;
    category: AchievementCategory;
    badgeIcon: string | null;
    xpReward: number;
    coinReward: number;
    tokenReward: number;
    targetValue: number;
}
