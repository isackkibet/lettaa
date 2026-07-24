"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const feedback_constants_1 = require("../../constants/feedback.constants");
const template_utils_1 = require("../../utils/template.utils");
const level_utils_1 = require("../../utils/level.utils");
const mission_utils_1 = require("../../utils/mission.utils");
/**
 * Generates a single specific, actionable feedback message per delivery.
 * Priority: level up > achievement > mission completed > late-delivery
 * warning > closest-to-completion mission nudge > default.
 */
class FeedbackService {
    generate(ctx) {
        if (ctx.levelUp) {
            return (0, template_utils_1.interpolate)(feedback_constants_1.FEEDBACK_TEMPLATES.LEVEL_UP, { levelTitle: ctx.levelTitle });
        }
        if (ctx.newlyUnlockedAchievements.length > 0) {
            return (0, template_utils_1.interpolate)(feedback_constants_1.FEEDBACK_TEMPLATES.ACHIEVEMENT_UNLOCKED, {
                achievementTitle: ctx.newlyUnlockedAchievements[0].title,
            });
        }
        if (ctx.newlyCompletedMissions.length > 0) {
            const mission = ctx.newlyCompletedMissions[0];
            return (0, template_utils_1.interpolate)(feedback_constants_1.FEEDBACK_TEMPLATES.MISSION_COMPLETE, {
                missionTitle: mission.title,
                xp: mission.xpReward,
            });
        }
        const nudge = this.buildClosestMissionNudge(ctx.missions);
        if (nudge)
            return nudge;
        if (ctx.wasLate) {
            return feedback_constants_1.FEEDBACK_TEMPLATES.LATE_DELIVERY;
        }
        const nextLevel = (0, level_utils_1.getNextLevel)(ctx.currentLevel);
        if (nextLevel) {
            return (0, template_utils_1.interpolate)(feedback_constants_1.FEEDBACK_TEMPLATES.NEXT_LEVEL_PROGRESS, {
                xpRemaining: nextLevel.xpThreshold - ctx.totalXp,
                nextLevelTitle: nextLevel.title,
            });
        }
        return (0, template_utils_1.interpolate)(feedback_constants_1.FEEDBACK_TEMPLATES.MAX_LEVEL, { levelTitle: ctx.levelTitle });
    }
    buildClosestMissionNudge(missions) {
        const primary = (0, mission_utils_1.pickPrimaryMission)(missions);
        if (!primary || primary.completed || primary.progress === 0)
            return null;
        const remaining = primary.target - primary.progress;
        return (0, template_utils_1.interpolate)(feedback_constants_1.FEEDBACK_TEMPLATES.MISSION_PROGRESS, {
            progressNote: 'Great consistency.',
            remaining,
            unit: remaining === 1 ? 'delivery' : 'deliveries',
            missionTitle: primary.title,
        });
    }
}
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=feedback.service.js.map