import { Player } from '../../interfaces';
/**
 * Blends punctuality, rating, and completion-rate signals into a single
 * 0-100 reputation score. Formula is intentionally simple for the MVP —
 * no historical decay or weighting by recency.
 */
export declare class ReputationService {
    calculate(player: Player): number;
}
