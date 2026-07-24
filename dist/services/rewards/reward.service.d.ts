import { Reward } from '../../interfaces';
/**
 * Determines whether the player qualifies for a reward this delivery.
 * This service only decides eligibility — issuing the reward (on-chain or
 * otherwise) is out of scope.
 * TODO(Backend Developer 2): wire actual reward issuance (Avalanche) to
 * `eligible === true` outcomes.
 */
export declare class RewardService {
    checkEligibility(reputation: number, levelUp: boolean, achievementsUnlocked: number): Reward;
}
