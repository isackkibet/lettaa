"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionService = void 0;
const missions_constants_1 = require("../../constants/missions.constants");
const mission_utils_1 = require("../../utils/mission.utils");
/**
 * Tracks progress on the three daily missions and completes them once their
 * target is reached. Progress counters (dailyMissionProgress) are read from
 * the player snapshot passed in — this service does not persist anything.
 * TODO(Backend Developer 2): daily counters must be reset at day rollover
 * before being passed into this service.
 */
class MissionService {
    updateProgress(player, event) {
        const progress = player.dailyMissionProgress;
        const alreadyCompleted = new Set(progress.completedMissionIds);
        const newlyCompleted = [];
        let xpAwarded = 0;
        const missions = Object.values(missions_constants_1.MISSION_DEFINITIONS).map((def) => {
            const currentProgress = this.getProgressCount(def.id, progress);
            const wasCompleted = alreadyCompleted.has(def.id);
            const nowCompleted = wasCompleted || currentProgress >= def.target;
            const mission = {
                id: def.id,
                title: def.title,
                description: def.description,
                progress: Math.min(currentProgress, def.target),
                target: def.target,
                completed: nowCompleted,
                xpReward: def.xpReward,
                coinReward: def.coinReward,
                gemReward: def.gemReward,
                tokenReward: def.tokenReward,
            };
            if (!wasCompleted && nowCompleted && event.deliveryCompleted) {
                newlyCompleted.push(mission);
                xpAwarded += def.xpReward;
            }
            return mission;
        });
        return { missions, newlyCompleted, xpAwarded };
    }
    /**
     * Summarizes progress on the single mission most worth surfacing in the
     * API response (see PlayerProgress.missionProgress).
     */
    getPrimaryMissionSummary(missions) {
        const primary = (0, mission_utils_1.pickPrimaryMission)(missions);
        if (!primary)
            return { completed: 0, target: 0 };
        return { completed: primary.progress, target: primary.target };
    }
    getProgressCount(id, progress) {
        switch (id) {
            case missions_constants_1.MissionId.FIVE_DELIVERIES:
                return progress.deliveriesToday;
            case missions_constants_1.MissionId.PERFECT_ON_TIME:
                // Fails for the day the moment a late delivery occurs.
                return progress.lateDeliveriesToday === 0 ? progress.deliveriesToday : 0;
            case missions_constants_1.MissionId.TWO_FIVE_STAR_RATINGS:
                return progress.fiveStarRatingsToday;
            default:
                return 0;
        }
    }
}
exports.MissionService = MissionService;
//# sourceMappingURL=mission.service.js.map