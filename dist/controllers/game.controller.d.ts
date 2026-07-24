import { Request, Response } from 'express';
import { GameService } from '../services/game.service';
export declare class GameController {
    private readonly gameService;
    constructor(gameService?: GameService);
    handleDelivery: (req: Request, res: Response) => Promise<void>;
    private getRewardReason;
    private calculateRewardAmount;
}
