import express from 'express';
import { Request, Response } from 'express';

import { initContext } from '@/handler/author/express/middleware/init-context';
import { visitorArticleRouter } from './router/visitor-artilce-router';

export const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(initContext);

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello Reader');
  });

  app.use('/v1/articles', visitorArticleRouter());

  return app;
};
