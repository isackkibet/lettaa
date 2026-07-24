"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XPService = void 0;
const xp_constants_1 = require("../../constants/xp.constants");
/**
 * Calculates XP delta for a single delivery event. Pure calculation —
 * no knowledge of totals, levels, or persistence.
 */
class XPService {
    calculateDeliveryXp(event) {
        const breakdown = [];
        let xpDelta = 0;
        if (!event.deliveryCompleted) {
            return { xpDelta: 0, breakdown };
        }
        xpDelta += xp_constants_1.XP_RULES.COMPLETE_DELIVERY;
        breakdown.push(`Complete Delivery: +${xp_constants_1.XP_RULES.COMPLETE_DELIVERY} XP`);
        if (event.onTime) {
            xpDelta += xp_constants_1.XP_RULES.ON_TIME_DELIVERY;
            breakdown.push(`On-Time Delivery: +${xp_constants_1.XP_RULES.ON_TIME_DELIVERY} XP`);
        }
        else {
            xpDelta += xp_constants_1.XP_RULES.LATE_DELIVERY;
            breakdown.push(`Late Delivery: ${xp_constants_1.XP_RULES.LATE_DELIVERY} XP`);
        }
        if (event.rating === 5) {
            xpDelta += xp_constants_1.XP_RULES.FIVE_STAR_RATING;
            breakdown.push(`5-Star Rating: +${xp_constants_1.XP_RULES.FIVE_STAR_RATING} XP`);
        }
        return { xpDelta, breakdown };
    }
    applyMissionBonus() {
        return xp_constants_1.XP_RULES.COMPLETE_DAILY_MISSION;
    }
}
exports.XPService = XPService;
//# sourceMappingURL=xp.service.js.map