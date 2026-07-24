export enum AchievementId {
  FIRST_DELIVERY = 'FIRST_DELIVERY',
  TEN_DELIVERIES = 'TEN_DELIVERIES',
  NEVER_LATE = 'NEVER_LATE',
  CUSTOMER_FAVORITE = 'CUSTOMER_FAVORITE',
  ELITE_RIDER = 'ELITE_RIDER',
}

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
}

/**
 * The five achievements supported in this MVP. Unlock conditions live in
 * AchievementService, keyed off PlayerProgress fields.
 */
export const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, AchievementDefinition> = {
  [AchievementId.FIRST_DELIVERY]: {
    id: AchievementId.FIRST_DELIVERY,
    title: 'First Delivery',
    description: 'Complete your first delivery.',
  },
  [AchievementId.TEN_DELIVERIES]: {
    id: AchievementId.TEN_DELIVERIES,
    title: '10 Deliveries',
    description: 'Complete 10 deliveries.',
  },
  [AchievementId.NEVER_LATE]: {
    id: AchievementId.NEVER_LATE,
    title: 'Never Late',
    description: 'Complete 10 deliveries in a row on time.',
  },
  [AchievementId.CUSTOMER_FAVORITE]: {
    id: AchievementId.CUSTOMER_FAVORITE,
    title: 'Customer Favorite',
    description: 'Receive 5 five-star ratings.',
  },
  [AchievementId.ELITE_RIDER]: {
    id: AchievementId.ELITE_RIDER,
    title: 'Elite Rider',
    description: 'Reach the Elite Rider level.',
  },
};
