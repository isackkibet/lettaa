import { XP_RULES } from '@/constants/xp.constants';
import { DeliveryEvent } from '@/interfaces';
import { XpCalculationResult } from '@/types/xp.types';

/**
 * Calculates XP delta for a single delivery event. Pure calculation —
 * no knowledge of totals, levels, or persistence.
 */
export class XPService {
  calculateDeliveryXp(event: DeliveryEvent): XpCalculationResult {
    const breakdown: string[] = [];
    let xpDelta = 0;

    if (!event.deliveryCompleted) {
      return { xpDelta: 0, breakdown };
    }

    xpDelta += XP_RULES.COMPLETE_DELIVERY;
    breakdown.push(`Complete Delivery: +${XP_RULES.COMPLETE_DELIVERY} XP`);

    if (event.onTime) {
      xpDelta += XP_RULES.ON_TIME_DELIVERY;
      breakdown.push(`On-Time Delivery: +${XP_RULES.ON_TIME_DELIVERY} XP`);
    } else {
      xpDelta += XP_RULES.LATE_DELIVERY;
      breakdown.push(`Late Delivery: ${XP_RULES.LATE_DELIVERY} XP`);
    }

    if (event.rating === 5) {
      xpDelta += XP_RULES.FIVE_STAR_RATING;
      breakdown.push(`5-Star Rating: +${XP_RULES.FIVE_STAR_RATING} XP`);
    }

    return { xpDelta, breakdown };
  }

  applyMissionBonus(): number {
    return XP_RULES.COMPLETE_DAILY_MISSION;
  }
}
