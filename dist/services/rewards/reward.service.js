"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardService = void 0;
const REPUTATION_ELIGIBILITY_THRESHOLD = 70;
/**
 * Determines whether the player qualifies for a reward this delivery.
 * This service only decides eligibility — issuing the reward (on-chain or
 * otherwise) is out of scope.
 * TODO(Backend Developer 2): wire actual reward issuance (Avalanche) to
 * `eligible === true` outcomes.
 */
class RewardService {
    checkEligibility(reputation, levelUp, achievementsUnlocked) {
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
exports.RewardService = RewardService;
//# sourceMappingURL=reward.service.js.map