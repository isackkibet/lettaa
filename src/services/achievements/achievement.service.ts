import { ACHIEVEMENT_DEFINITIONS, AchievementId } from '@/constants/achievements.constants';
import { Achievement, Player } from '@/interfaces';
import { MAX_LEVEL } from '@/constants/levels.constants';

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
      [AchievementId.FIRST_DELIVERY]: player.deliveriesCompleted >= 1,
      [AchievementId.TEN_DELIVERIES]: player.deliveriesCompleted >= 10,
      [AchievementId.NEVER_LATE]: player.currentOnTimeStreak >= 10,
      [AchievementId.CUSTOMER_FAVORITE]: player.fiveStarRatings >= 5,
      [AchievementId.ELITE_RIDER]: currentLevel >= MAX_LEVEL - 1,
    };

    const all: Achievement[] = Object.values(ACHIEVEMENT_DEFINITIONS).map((def) => {
      const wasEarned = alreadyUnlocked.has(def.id);
      const isEarned = wasEarned || conditionMet[def.id];

      if (!wasEarned && isEarned) {
        const achievement: Achievement = {
          id: def.id,
          title: def.title,
          description: def.description,
          earned: true,
          earnedAt: now,
        };
        newlyUnlocked.push(achievement);
        return achievement;
      }

      // TODO(Backend Developer 2): previously-earned achievements should carry
      // their real earnedAt from storage instead of `now` once persistence exists.
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        earned: isEarned,
        earnedAt: isEarned ? now : null,
      };
    });

    return { all, newlyUnlocked };
  }
}
