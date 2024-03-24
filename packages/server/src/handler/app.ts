import express from 'express';
import { Request, Response } from 'express';
import { buildArticleRouter } from './article/articleRouter';

export const buildApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World from Express!');
  });

  app.use('/v1/articles', buildArticleRouter());

  return app;
};
