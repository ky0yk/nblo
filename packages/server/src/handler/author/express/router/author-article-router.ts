import { Router } from 'express';
import { getOwnArticleHandler } from '../../article/get-own-article-handler';
import { updateArticleHandler } from '../../article/update-article-handler';
import { deleteArticleHandler } from '../../article/delete-article-handler';
import { createArticleHandler } from '../../article/create-article-handler';
import { requireAuth } from '@/handler/author/express/middleware/auth/require-auth';

export const authorArticleRouter = () => {
  const router = Router();

  router.post('/', requireAuth, createArticleHandler);
  router.get('/:articleId', requireAuth, getOwnArticleHandler);
  router.patch('/:articleId', requireAuth, updateArticleHandler);
  router.delete('/:articleId', requireAuth, deleteArticleHandler);

  return router;
};
