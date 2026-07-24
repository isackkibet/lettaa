/**
 * Weights must sum to 1. Reputation is a weighted blend of three
 * player behavior signals, scaled to a 0-100 score.
 */
export declare const REPUTATION_WEIGHTS: {
    readonly PUNCTUALITY: 0.4;
    readonly RATING: 0.35;
    readonly COMPLETION_RATE: 0.25;
};
