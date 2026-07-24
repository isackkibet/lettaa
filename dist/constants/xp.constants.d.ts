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
export declare const XP_RULES: {
    readonly COMPLETE_DELIVERY: 50;
    readonly ON_TIME_DELIVERY: 20;
    readonly FIVE_STAR_RATING: 40;
    readonly COMPLETE_DAILY_MISSION: 100;
    readonly LATE_DELIVERY: -20;
};
/**
 * The remaining `letaa_gamification.xp_actions` rows that don't yet have a
 * corresponding signal in `DeliveryEvent` (e.g. EARLY_DELIVERY needs
 * expected/actual duration, which the engine's minimal event doesn't carry).
 * Defined here for parity with the DB and for services to consume as those
 * signals become available, but not yet wired into XPService.
 */
export declare const DB_XP_ACTIONS: {
    readonly ACCEPT_DELIVERY: 5;
    readonly EARLY_DELIVERY: 30;
    readonly CONSECUTIVE_DELIVERIES: 25;
    readonly DAILY_LOGIN: 10;
    readonly WEEKLY_GOAL_COMPLETED: 150;
    readonly MONTHLY_CHALLENGE_COMPLETED: 500;
    readonly REFERRAL_BONUS: 200;
    readonly ACHIEVEMENT_UNLOCKED: 100;
    readonly LEVEL_UP: 75;
    readonly PERFECT_WEEK: 300;
    readonly PERFECT_MONTH: 800;
};
