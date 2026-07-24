import { REPUTATION_WEIGHTS } from '@/constants/reputation.constants';
import { Player } from '@/interfaces';
import { clamp, safeDivide } from '@/utils/math.utils';

/**
 * Blends punctuality, rating, and completion-rate signals into a single
 * 0-100 reputation score. Formula is intentionally simple for the MVP —
 * no historical decay or weighting by recency.
 */
export class ReputationService {
  calculate(player: Player): number {
    const totalDeliveries = player.totalDeliveries;

    const punctualityRate = safeDivide(player.onTimeDeliveries, totalDeliveries, 1);
    const averageRatingScore = safeDivide(
      player.fiveStarRatings,
      player.totalRatedDeliveries,
      1,
    );
    // Completion rate has no "attempted but abandoned" concept in this MVP,
    // so it rewards volume up to a soft cap of 20 deliveries.
    const completionRate = clamp(safeDivide(totalDeliveries, 20, 0), 0, 1);

    const score =
      punctualityRate * REPUTATION_WEIGHTS.PUNCTUALITY +
      averageRatingScore * REPUTATION_WEIGHTS.RATING +
      completionRate * REPUTATION_WEIGHTS.COMPLETION_RATE;

    return Math.round(clamp(score, 0, 1) * 100);
  }
}
