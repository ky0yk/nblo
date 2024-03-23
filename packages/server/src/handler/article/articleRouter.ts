import { Router } from 'express';
import { getArticleHandler } from './get-article-handler';
import { listArticlesHandler } from './list-article-handler';
import { updateArticleHandler } from './update-article-handler';
import { deleteArticleHandler } from './delete-article-handler';
import { createArticleHandler } from './create-article-handler';

export const buildArticleRouter = () => {
  const router = Router();

  router.get('/', listArticlesHandler);
  router.post('/', createArticleHandler);
  router.get('/:articleId', getArticleHandler);
  router.patch('/:articleId', updateArticleHandler);
  router.delete('/:articleId', deleteArticleHandler);

  return router;
};
