/**
 * Weights must sum to 1. Reputation is a weighted blend of three
 * player behavior signals, scaled to a 0-100 score.
 */
export const REPUTATION_WEIGHTS = {
  PUNCTUALITY: 0.4,
  RATING: 0.35,
  COMPLETION_RATE: 0.25,
} as const;
