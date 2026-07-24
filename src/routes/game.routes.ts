import { Router } from 'express';
import { GameController } from '@/controllers/game.controller';

const router = Router();
const gameController = new GameController();

router.post('/delivery', gameController.handleDelivery);

export default router;
