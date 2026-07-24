"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_XP_ACTIONS = exports.XP_RULES = void 0;
/**
 * XP awarded/deducted per game event. Keep all XP magic numbers here.
 *
 * The five rules below are wired into XPService/MissionService. COMPLETE_DELIVERY
 * and FIVE_STAR_RATING are synced to the matching action_name rows in
 * `letaa_gamification.xp_actions` (letaa_db.sql). ON_TIME_DELIVERY,
 * COMPLETE_DAILY_MISSION, and LATE_DELIVERY have no DB counterpart — the DB
 * has no "on time" or penalty action, and mission XP is per-quest
 * (reward_xp) rather than a flat bonus — so those three stay engine-only.
 */
exports.XP_RULES = {
    COMPLETE_DELIVERY: 50,
    ON_TIME_DELIVERY: 20,
    FIVE_STAR_RATING: 40,
    COMPLETE_DAILY_MISSION: 100,
    LATE_DELIVERY: -20,
};
/**
 * The remaining `letaa_gamification.xp_actions` rows that don't yet have a
 * corresponding signal in `DeliveryEvent` (e.g. EARLY_DELIVERY needs
 * expected/actual duration, which the engine's minimal event doesn't carry).
 * Defined here for parity with the DB and for services to consume as those
 * signals become available, but not yet wired into XPService.
 */
exports.DB_XP_ACTIONS = {
    ACCEPT_DELIVERY: 5,
    EARLY_DELIVERY: 30,
    CONSECUTIVE_DELIVERIES: 25,
    DAILY_LOGIN: 10,
    WEEKLY_GOAL_COMPLETED: 150,
    MONTHLY_CHALLENGE_COMPLETED: 500,
    REFERRAL_BONUS: 200,
    ACHIEVEMENT_UNLOCKED: 100,
    LEVEL_UP: 75,
    PERFECT_WEEK: 300,
    PERFECT_MONTH: 800,
};
//# sourceMappingURL=xp.constants.js.map