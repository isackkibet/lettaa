"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
const achievements_constants_1 = require("../../constants/achievements.constants");
/**
 * Evaluates unlock conditions for the five supported achievements against
 * the player's cumulative stats (post-delivery). Returns the full achievement
 * list plus the subset newly unlocked by this delivery.
 */
class AchievementService {
    evaluate(player, currentLevel) {
        const alreadyUnlocked = new Set(player.unlockedAchievementIds);
        const now = new Date().toISOString();
        const newlyUnlocked = [];
        const conditionMet = {
            [achievements_constants_1.AchievementId.FIRST_DELIVERY]: player.totalDeliveries >= 1,
            [achievements_constants_1.AchievementId.TEN_DELIVERIES]: player.totalDeliveries >= 10,
            [achievements_constants_1.AchievementId.NEVER_LATE]: player.currentStreak >= achievements_constants_1.ACHIEVEMENT_DEFINITIONS[achievements_constants_1.AchievementId.NEVER_LATE].targetValue,
            [achievements_constants_1.AchievementId.CUSTOMER_FAVORITE]: player.fiveStarRatings >= achievements_constants_1.ACHIEVEMENT_DEFINITIONS[achievements_constants_1.AchievementId.CUSTOMER_FAVORITE].targetValue,
            [achievements_constants_1.AchievementId.ELITE_RIDER]: currentLevel >= achievements_constants_1.ACHIEVEMENT_DEFINITIONS[achievements_constants_1.AchievementId.ELITE_RIDER].targetValue,
        };
        const all = Object.values(achievements_constants_1.ACHIEVEMENT_DEFINITIONS).map((def) => {
            const wasEarned = alreadyUnlocked.has(def.id);
            const isEarned = wasEarned || conditionMet[def.id];
            const achievement = {
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
exports.AchievementService = AchievementService;
//# sourceMappingURL=achievement.service.js.map