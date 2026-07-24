"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPUTATION_WEIGHTS = void 0;
/**
 * Weights must sum to 1. Reputation is a weighted blend of three
 * player behavior signals, scaled to a 0-100 score.
 */
exports.REPUTATION_WEIGHTS = {
    PUNCTUALITY: 0.4,
    RATING: 0.35,
    COMPLETION_RATE: 0.25,
};
//# sourceMappingURL=reputation.constants.js.map