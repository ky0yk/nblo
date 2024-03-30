import express from 'express';
import { Request, Response } from 'express';
import { buildArticleRouter } from './article/articleRouter';
import { authenticate } from '@/handler/middleware/authenticate';

export const buildApp = () => {
  const app = express();
  app.use(express.json());

  app.use(authenticate);

  app.get('/', (req: Request, res: Response) => {
    const msg = `Hello ${req.context.userId}`;
    res.send(msg);
  });

  app.use('/v1/articles', buildArticleRouter());

  return app;
};
