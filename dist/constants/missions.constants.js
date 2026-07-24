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
 *
 * `letaa_gamification.quests` (letaa_db.sql) is the DB equivalent ("quests"
 * there, "missions" here — same concept, different name in each layer).
 * FIVE_DELIVERIES has an exact target match with the DB's "Complete 5
 * Deliveries" DAILY quest, so its xpReward/coinReward/tokenReward are synced
 * to that row. PERFECT_ON_TIME and TWO_FIVE_STAR_RATINGS don't have a
 * same-target DB quest to sync against (DB's closest analogues use different
 * targets: "On-Time Delivery" target=1, "Three 5-Star Reviews" target=3), so
 * their reward fields stay engine-only defaults for now.
 */
exports.MISSION_DEFINITIONS = {
    [MissionId.FIVE_DELIVERIES]: {
        id: MissionId.FIVE_DELIVERIES,
        title: 'Mission 1',
        description: 'Complete 5 deliveries.',
        target: 5,
        xpReward: 50,
        coinReward: 5,
        gemReward: 0,
        tokenReward: 0.1,
    },
    [MissionId.PERFECT_ON_TIME]: {
        id: MissionId.PERFECT_ON_TIME,
        title: 'Mission 2',
        description: 'Maintain 100% on-time deliveries today.',
        // Same volume as Mission 1 (5 deliveries), but fails if any is late.
        target: 5,
        xpReward: 100,
        coinReward: 0,
        gemReward: 0,
        tokenReward: 0,
    },
    [MissionId.TWO_FIVE_STAR_RATINGS]: {
        id: MissionId.TWO_FIVE_STAR_RATINGS,
        title: 'Mission 3',
        description: 'Receive two 5-star ratings.',
        target: 2,
        xpReward: 100,
        coinReward: 0,
        gemReward: 0,
        tokenReward: 0,
    },
};
//# sourceMappingURL=missions.constants.js.map