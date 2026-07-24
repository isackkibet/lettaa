import express, { Application } from 'express';
import cors from 'cors';
import routes from '@/routes';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', routes);

  return app;
}
