export enum MissionId {
  FIVE_DELIVERIES = 'FIVE_DELIVERIES',
  PERFECT_ON_TIME = 'PERFECT_ON_TIME',
  TWO_FIVE_STAR_RATINGS = 'TWO_FIVE_STAR_RATINGS',
}

export interface MissionDefinition {
  id: MissionId;
  title: string;
  description: string;
  target: number;
  xpReward: number;
}

/**
 * The three daily missions supported in this MVP. `target` is the progress
 * count required to complete the mission; progress semantics are mission-specific
 * and interpreted by MissionService.
 */
export const MISSION_DEFINITIONS: Record<MissionId, MissionDefinition> = {
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
