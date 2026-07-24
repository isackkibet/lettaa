"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_service_1 = require("../services/game.service");
const player_model_1 = require("../models/player.model");
class GameController {
    constructor(gameService = new game_service_1.GameService()) {
        this.gameService = gameService;
        this.handleDelivery = (req, res) => {
            const body = req.body;
            if (typeof body?.deliveryCompleted !== 'boolean' || typeof body?.onTime !== 'boolean') {
                res.status(400).json({
                    error: 'Request body must include boolean fields deliveryCompleted and onTime.',
                });
                return;
            }
            if (body.rating !== undefined && (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5)) {
                res.status(400).json({ error: 'rating must be a number between 1 and 5.' });
                return;
            }
            // TODO(Backend Developer 2): replace this with a fetch of the
            // authenticated player's persisted state from Supabase, e.g.:
            //   const player = await playerRepository.findById(req.user.id);
            const player = body.player ?? (0, player_model_1.createDefaultPlayer)(req.body.playerId ?? 'anonymous');
            const event = {
                deliveryCompleted: body.deliveryCompleted,
                onTime: body.onTime,
                rating: body.rating,
            };
            const progress = this.gameService.processDelivery(player, event);
            // TODO(Backend Developer 2): persist `progress`-derived player state back
            // to Supabase here, and trigger Avalanche reward issuance when
            // progress.rewardEligible is true.
            res.status(200).json({
                xpEarned: progress.xpEarned,
                totalXp: progress.totalXp,
                level: progress.level,
                levelTitle: progress.levelTitle,
                levelUp: progress.levelUp,
                achievementUnlocked: progress.achievementsUnlocked.map((a) => a.title),
                missionProgress: progress.missionProgress,
                reputation: progress.reputation,
                rewardEligible: progress.rewardEligible,
                feedback: progress.feedback,
            });
        };
    }
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map