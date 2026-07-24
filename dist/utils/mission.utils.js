"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickPrimaryMission = pickPrimaryMission;
/**
 * Picks the mission most worth surfacing to the player: the incomplete
 * mission closest to completion, or (if all are complete) the last one.
 * Shared by MissionService's summary and FeedbackService's nudge so both
 * agree on which mission is "the" mission this response is about.
 */
function pickPrimaryMission(missions) {
    if (missions.length === 0)
        return null;
    const incomplete = missions.filter((m) => !m.completed);
    if (incomplete.length === 0) {
        return missions[missions.length - 1];
    }
    return [...incomplete].sort((a, b) => b.progress / b.target - a.progress / a.target)[0];
}
//# sourceMappingURL=mission.utils.js.map