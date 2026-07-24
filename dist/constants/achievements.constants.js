"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACHIEVEMENT_DEFINITIONS = exports.AchievementId = void 0;
var AchievementId;
(function (AchievementId) {
    AchievementId["FIRST_DELIVERY"] = "FIRST_DELIVERY";
    AchievementId["TEN_DELIVERIES"] = "TEN_DELIVERIES";
    AchievementId["NEVER_LATE"] = "NEVER_LATE";
    AchievementId["CUSTOMER_FAVORITE"] = "CUSTOMER_FAVORITE";
    AchievementId["ELITE_RIDER"] = "ELITE_RIDER";
})(AchievementId || (exports.AchievementId = AchievementId = {}));
/**
 * The five achievements supported in this MVP. Unlock conditions live in
 * AchievementService, keyed off PlayerProgress fields.
 */
exports.ACHIEVEMENT_DEFINITIONS = {
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
//# sourceMappingURL=achievements.constants.js.map