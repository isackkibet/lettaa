"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_service_1 = require("../services/game.service");
const player_model_1 = require("../models/player.model");
const reward_service_1 = require("../blockchain/reward.service");
const supabase_client_1 = require("../database/supabase.client");
class GameController {
    constructor(gameService = new game_service_1.GameService()) {
        this.gameService = gameService;
        this.handleDelivery = async (req, res) => {
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
            const riderId = body.riderId ?? req.body.playerId ?? 'anonymous';
            const player = body.player ?? (0, player_model_1.createDefaultPlayer)(riderId);
            const event = {
                deliveryCompleted: body.deliveryCompleted,
                onTime: body.onTime,
                rating: body.rating,
            };
            const progress = this.gameService.processDelivery(player, event);
            const { data: rider } = await supabase_client_1.supabase
                .from('riders')
                .select('wallet_address')
                .eq('id', riderId)
                .single();
            if (progress.rewardEligible && rider?.wallet_address) {
                const reason = this.getRewardReason(progress);
                const amount = this.calculateRewardAmount(progress);
                console.log(`[GameController] Reward eligible for ${riderId}: ${amount} RXP for ${reason}`);
                const result = await (0, reward_service_1.distributeReward)(riderId, rider.wallet_address, amount, reason);
                if (result.success) {
                    console.log(`[GameController] Reward distributed: ${result.txHash} (mocked: ${result.mocked})`);
                }
                else {
                    console.error(`[GameController] Reward distribution failed: ${result.error}`);
                }
            }
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
    getRewardReason(progress) {
        if (progress.levelUp)
            return `level_up_${progress.level}`;
        if (progress.achievementsUnlocked.length > 0)
            return `achievement_${progress.achievementsUnlocked[0].id}`;
        if (progress.missionProgress.completed > 0)
            return `mission_complete_${progress.missionProgress.completed}`;
        return 'reputation_reward';
    }
    calculateRewardAmount(progress) {
        if (progress.levelUp)
            return progress.level * 100;
        if (progress.achievementsUnlocked.length > 0)
            return progress.achievementsUnlocked.length * 200;
        if (progress.missionProgress.completed > 0)
            return progress.missionProgress.completed * 500;
        return 100;
    }
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map