export enum AchievementId {
  FIRST_DELIVERY = 'FIRST_DELIVERY',
  TEN_DELIVERIES = 'TEN_DELIVERIES',
  NEVER_LATE = 'NEVER_LATE',
  CUSTOMER_FAVORITE = 'CUSTOMER_FAVORITE',
  ELITE_RIDER = 'ELITE_RIDER',
}

/** Mirrors letaa_core.achievement_category. */
export type AchievementCategory =
  | 'DELIVERY_MILESTONE'
  | 'SPEED'
  | 'CUSTOMER_SERVICE'
  | 'RELIABILITY'
  | 'SPECIAL_EVENT';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  category: AchievementCategory;
  badgeIcon: string | null;
  xpReward: number;
  coinReward: number;
  tokenReward: number;
  targetValue: number;
}

/**
 * The five achievements supported in this MVP. Unlock conditions live in
 * AchievementService, keyed off Player fields.
 *
 * FIRST_DELIVERY, TEN_DELIVERIES, NEVER_LATE, and CUSTOMER_FAVORITE are
 * synced field-for-field (description/xpReward/coinReward/tokenReward/
 * targetValue) against the matching rows in `letaa_gamification.achievements`
 * (letaa_db.sql). ELITE_RIDER has no DB counterpart — the DB's level ladder
 * has no "Elite Rider" title (closest is level 7, "Elite Courier"), so its
 * condition/copy point at that level instead and its reward fields fall back
 * to the generic ACHIEVEMENT_UNLOCKED xp action value.
 */
export const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, AchievementDefinition> = {
  [AchievementId.FIRST_DELIVERY]: {
    id: AchievementId.FIRST_DELIVERY,
    title: 'First Delivery',
    description: 'Complete your first delivery.',
    category: 'DELIVERY_MILESTONE',
    badgeIcon: 'badge_first_delivery.png',
    xpReward: 100,
    coinReward: 10,
    tokenReward: 0.5,
    targetValue: 1,
  },
  [AchievementId.TEN_DELIVERIES]: {
    id: AchievementId.TEN_DELIVERIES,
    title: '10 Deliveries',
    description: 'Complete 10 deliveries.',
    category: 'DELIVERY_MILESTONE',
    badgeIcon: 'badge_10_deliveries.png',
    xpReward: 200,
    coinReward: 25,
    tokenReward: 1.0,
    targetValue: 10,
  },
  [AchievementId.NEVER_LATE]: {
    id: AchievementId.NEVER_LATE,
    title: 'Never Late',
    description: '100% on-time for 30 deliveries.',
    category: 'RELIABILITY',
    badgeIcon: 'badge_never_late.png',
    xpReward: 300,
    coinReward: 30,
    tokenReward: 1.0,
    targetValue: 30,
  },
  [AchievementId.CUSTOMER_FAVORITE]: {
    id: AchievementId.CUSTOMER_FAVORITE,
    title: 'Customer Favorite',
    description: 'Receive 25 five-star ratings.',
    category: 'CUSTOMER_SERVICE',
    badgeIcon: 'badge_customer_favorite.png',
    xpReward: 400,
    coinReward: 50,
    tokenReward: 2.0,
    targetValue: 25,
  },
  [AchievementId.ELITE_RIDER]: {
    id: AchievementId.ELITE_RIDER,
    title: 'Elite Rider',
    description: 'Reach the Elite Courier level or higher.',
    category: 'SPECIAL_EVENT',
    badgeIcon: null,
    xpReward: 100,
    coinReward: 0,
    tokenReward: 0,
    targetValue: 7, // level number for "Elite Courier" in the letaa_core.levels ladder
  },
};
