import { Reward } from '@/interfaces';

const REPUTATION_ELIGIBILITY_THRESHOLD = 70;

/**
 * Determines whether the player qualifies for a reward this delivery.
 * This service only decides eligibility — issuing the reward (on-chain or
 * otherwise) is out of scope.
 * TODO(Backend Developer 2): wire actual reward issuance (Avalanche) to
 * `eligible === true` outcomes.
 */
export class RewardService {
  checkEligibility(reputation: number, levelUp: boolean, achievementsUnlocked: number): Reward {
    if (levelUp) {
      return { eligible: true, reason: 'Reward unlocked for leveling up.' };
    }
    if (achievementsUnlocked > 0) {
      return { eligible: true, reason: 'Reward unlocked for earning an achievement.' };
    }
    if (reputation >= REPUTATION_ELIGIBILITY_THRESHOLD) {
      return { eligible: true, reason: 'Reward unlocked for maintaining strong reputation.' };
    }
    return { eligible: false, reason: 'No reward criteria met this delivery.' };
  }
}
