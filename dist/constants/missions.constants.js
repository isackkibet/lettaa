"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISSION_DEFINITIONS = exports.MissionId = void 0;
var MissionId;
(function (MissionId) {
    MissionId["FIVE_DELIVERIES"] = "FIVE_DELIVERIES";
    MissionId["PERFECT_ON_TIME"] = "PERFECT_ON_TIME";
    MissionId["TWO_FIVE_STAR_RATINGS"] = "TWO_FIVE_STAR_RATINGS";
})(MissionId || (exports.MissionId = MissionId = {}));
/**
 * The three daily missions supported in this MVP. `target` is the progress
 * count required to complete the mission; progress semantics are mission-specific
 * and interpreted by MissionService.
 */
exports.MISSION_DEFINITIONS = {
    [MissionId.FIVE_DELIVERIES]: {
        id: MissionId.FIVE_DELIVERIES,
        title: 'Mission 1',
        description: 'Complete 5 deliveries.',
        target: 5,
        xpReward: 100,
    },
    [MissionId.PERFECT_ON_TIME]: {
        id: MissionId.PERFECT_ON_TIME,
        title: 'Mission 2',
        description: 'Maintain 100% on-time deliveries today.',
        // Same volume as Mission 1 (5 deliveries), but fails if any is late.
        target: 5,
        xpReward: 100,
    },
    [MissionId.TWO_FIVE_STAR_RATINGS]: {
        id: MissionId.TWO_FIVE_STAR_RATINGS,
        title: 'Mission 3',
        description: 'Receive two 5-star ratings.',
        target: 2,
        xpReward: 100,
    },
};
//# sourceMappingURL=missions.constants.js.map