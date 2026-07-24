import { ACHIEVEMENT_DEFINITIONS, AchievementId } from '@/constants/achievements.constants';
import { Achievement, Player } from '@/interfaces';

/**
 * Evaluates unlock conditions for the five supported achievements against
 * the player's cumulative stats (post-delivery). Returns the full achievement
 * list plus the subset newly unlocked by this delivery.
 */
export class AchievementService {
  evaluate(player: Player, currentLevel: number): { all: Achievement[]; newlyUnlocked: Achievement[] } {
    const alreadyUnlocked = new Set(player.unlockedAchievementIds);
    const now = new Date().toISOString();
    const newlyUnlocked: Achievement[] = [];

    const conditionMet: Record<AchievementId, boolean> = {
      [AchievementId.FIRST_DELIVERY]: player.totalDeliveries >= 1,
      [AchievementId.TEN_DELIVERIES]: player.totalDeliveries >= 10,
      [AchievementId.NEVER_LATE]: player.currentStreak >= ACHIEVEMENT_DEFINITIONS[AchievementId.NEVER_LATE].targetValue,
      [AchievementId.CUSTOMER_FAVORITE]:
        player.fiveStarRatings >= ACHIEVEMENT_DEFINITIONS[AchievementId.CUSTOMER_FAVORITE].targetValue,
      [AchievementId.ELITE_RIDER]: currentLevel >= ACHIEVEMENT_DEFINITIONS[AchievementId.ELITE_RIDER].targetValue,
    };

    const all: Achievement[] = Object.values(ACHIEVEMENT_DEFINITIONS).map((def) => {
      const wasEarned = alreadyUnlocked.has(def.id);
      const isEarned = wasEarned || conditionMet[def.id];

      const achievement: Achievement = {
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        badgeIcon: def.badgeIcon,
        xpReward: def.xpReward,
        coinReward: def.coinReward,
        tokenReward: def.tokenReward,
        targetValue: def.targetValue,
        earned: isEarned,
        // TODO(Backend Developer 2): previously-earned achievements should carry
        // their real earnedAt from storage instead of `now` once persistence exists.
        earnedAt: isEarned ? now : null,
      };

      if (!wasEarned && isEarned) {
        newlyUnlocked.push(achievement);
      }

      return achievement;
    });

    return { all, newlyUnlocked };
  }
}
