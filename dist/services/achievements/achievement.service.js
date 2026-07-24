"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
const achievements_constants_1 = require("../../constants/achievements.constants");
const levels_constants_1 = require("../../constants/levels.constants");
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
            [achievements_constants_1.AchievementId.FIRST_DELIVERY]: player.deliveriesCompleted >= 1,
            [achievements_constants_1.AchievementId.TEN_DELIVERIES]: player.deliveriesCompleted >= 10,
            [achievements_constants_1.AchievementId.NEVER_LATE]: player.currentOnTimeStreak >= 10,
            [achievements_constants_1.AchievementId.CUSTOMER_FAVORITE]: player.fiveStarRatings >= 5,
            [achievements_constants_1.AchievementId.ELITE_RIDER]: currentLevel >= levels_constants_1.MAX_LEVEL - 1,
        };
        const all = Object.values(achievements_constants_1.ACHIEVEMENT_DEFINITIONS).map((def) => {
            const wasEarned = alreadyUnlocked.has(def.id);
            const isEarned = wasEarned || conditionMet[def.id];
            if (!wasEarned && isEarned) {
                const achievement = {
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
exports.AchievementService = AchievementService;
//# sourceMappingURL=achievement.service.js.map