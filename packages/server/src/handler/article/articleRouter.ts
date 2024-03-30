import { Router } from 'express';
import { getArticleHandler } from './get-article-handler';
import { updateArticleHandler } from './update-article-handler';
import { deleteArticleHandler } from './delete-article-handler';
import { createArticleHandler } from './create-article-handler';
import { requireAuth } from '@/handler/middleware/require-auth';

export const buildArticleRouter = () => {
  const router = Router();

  router.post('/', requireAuth, createArticleHandler);
  router.get('/:articleId', getArticleHandler);
  router.patch('/:articleId', requireAuth, updateArticleHandler);
  router.delete('/:articleId', requireAuth, deleteArticleHandler);

  return router;
};
