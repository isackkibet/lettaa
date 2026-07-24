import { Request, Response } from 'express';
import { GameService } from '@/services/game.service';
import { DeliveryEvent, Player } from '@/interfaces';
import { createDefaultPlayer } from '@/models/player.model';
import { distributeReward } from '@/blockchain/reward.service';
import { supabase } from '@/database/supabase.client';

interface DeliveryRequestBody extends DeliveryEvent {
  player?: Player;
  riderId?: string;
}

export class GameController {
  constructor(private readonly gameService: GameService = new GameService()) {}

  handleDelivery = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as DeliveryRequestBody;

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
    const player: Player = body.player ?? createDefaultPlayer(riderId);

    const event: DeliveryEvent = {
      deliveryCompleted: body.deliveryCompleted,
      onTime: body.onTime,
      rating: body.rating,
    };

    const progress = this.gameService.processDelivery(player, event);

    const { data: rider } = await supabase
      .from('riders')
      .select('wallet_address')
      .eq('id', riderId)
      .single();

    if (progress.rewardEligible && rider?.wallet_address) {
      const reason = this.getRewardReason(progress);
      const amount = this.calculateRewardAmount(progress);

      console.log(`[GameController] Reward eligible for ${riderId}: ${amount} RXP for ${reason}`);

      const result = await distributeReward(riderId, rider.wallet_address, amount, reason);

      if (result.success) {
        console.log(`[GameController] Reward distributed: ${result.txHash} (mocked: ${result.mocked})`);
      } else {
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

  private getRewardReason(progress: any): string {
    if (progress.levelUp) return `level_up_${progress.level}`;
    if (progress.achievementsUnlocked.length > 0) return `achievement_${progress.achievementsUnlocked[0].id}`;
    if (progress.missionProgress.completed > 0) return `mission_complete_${progress.missionProgress.completed}`;
    return 'reputation_reward';
  }

  private calculateRewardAmount(progress: any): number {
    if (progress.levelUp) return progress.level * 100;
    if (progress.achievementsUnlocked.length > 0) return progress.achievementsUnlocked.length * 200;
    if (progress.missionProgress.completed > 0) return progress.missionProgress.completed * 500;
    return 100;
  }
}
