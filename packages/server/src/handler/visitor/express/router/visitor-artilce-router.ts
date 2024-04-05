import { Router } from 'express';
import { getPublicArticleHandler } from '../../artilce/get-public-article-handler';

export const visitorArticleRouter = () => {
  const router = Router();

  router.get('/:articleId', getPublicArticleHandler);

  return router;
};
