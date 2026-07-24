"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const reputation_constants_1 = require("../../constants/reputation.constants");
const math_utils_1 = require("../../utils/math.utils");
/**
 * Blends punctuality, rating, and completion-rate signals into a single
 * 0-100 reputation score. Formula is intentionally simple for the MVP —
 * no historical decay or weighting by recency.
 */
class ReputationService {
    calculate(player) {
        const totalDeliveries = player.totalDeliveries;
        const punctualityRate = (0, math_utils_1.safeDivide)(player.onTimeDeliveries, totalDeliveries, 1);
        const averageRatingScore = (0, math_utils_1.safeDivide)(player.fiveStarRatings, player.totalRatedDeliveries, 1);
        // Completion rate has no "attempted but abandoned" concept in this MVP,
        // so it rewards volume up to a soft cap of 20 deliveries.
        const completionRate = (0, math_utils_1.clamp)((0, math_utils_1.safeDivide)(totalDeliveries, 20, 0), 0, 1);
        const score = punctualityRate * reputation_constants_1.REPUTATION_WEIGHTS.PUNCTUALITY +
            averageRatingScore * reputation_constants_1.REPUTATION_WEIGHTS.RATING +
            completionRate * reputation_constants_1.REPUTATION_WEIGHTS.COMPLETION_RATE;
        return Math.round((0, math_utils_1.clamp)(score, 0, 1) * 100);
    }
}
exports.ReputationService = ReputationService;
//# sourceMappingURL=reputation.service.js.map