import { Request, Response } from 'express';
import { GameService } from '@/services/game.service';
import { DeliveryEvent, Player } from '@/interfaces';
import { createDefaultPlayer } from '@/models/player.model';

/**
 * POST /api/game/delivery request body. `deliveryCompleted`/`onTime`/`rating`
 * match the public API contract; `player` is an optional escape hatch for
 * local testing/demos so the engine can be exercised statefully before a
 * real persistence layer exists.
 */
interface DeliveryRequestBody extends DeliveryEvent {
  player?: Player;
}

export class GameController {
  constructor(private readonly gameService: GameService = new GameService()) {}

  handleDelivery = (req: Request, res: Response): void => {
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

    // TODO(Backend Developer 2): replace this with a fetch of the
    // authenticated player's persisted state from Supabase, e.g.:
    //   const player = await playerRepository.findById(req.user.id);
    const player: Player = body.player ?? createDefaultPlayer(req.body.playerId ?? 'anonymous');

    const event: DeliveryEvent = {
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
