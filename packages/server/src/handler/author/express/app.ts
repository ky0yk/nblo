import express from 'express';
import { Request, Response } from 'express';
import { authorArticleRouter } from './router/author-article-router';
import { authenticate } from '@/handler/author/express/middleware/auth/authenticate';
import { initContext } from './middleware/init-context';

export const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(initContext);

  app.use(authenticate);

  app.get('/', (req: Request, res: Response) => {
    const msg = `Hello Author:${req.context.userId}`;
    res.send(msg);
  });

  app.use('/v1/author/articles', authorArticleRouter());

  return app;
};
