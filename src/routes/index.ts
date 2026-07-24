import { Router } from 'express';
import gameRoutes from './game.routes';
import riderRoutes from './rider.routes';

const router = Router();

router.use('/game', gameRoutes);
router.use('/riders', riderRoutes);

export default router;
