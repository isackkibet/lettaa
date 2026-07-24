import { Achievement, Player } from '../../interfaces';
/**
 * Evaluates unlock conditions for the five supported achievements against
 * the player's cumulative stats (post-delivery). Returns the full achievement
 * list plus the subset newly unlocked by this delivery.
 */
export declare class AchievementService {
    evaluate(player: Player, currentLevel: number): {
        all: Achievement[];
        newlyUnlocked: Achievement[];
    };
}
