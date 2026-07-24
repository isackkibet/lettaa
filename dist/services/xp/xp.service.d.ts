import { DeliveryEvent } from '../../interfaces';
import { XpCalculationResult } from '../../types/xp.types';
/**
 * Calculates XP delta for a single delivery event. Pure calculation —
 * no knowledge of totals, levels, or persistence.
 */
export declare class XPService {
    calculateDeliveryXp(event: DeliveryEvent): XpCalculationResult;
    applyMissionBonus(): number;
}
