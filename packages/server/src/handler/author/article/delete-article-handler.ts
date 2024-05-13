import { Request, Response } from 'express';
import { handleArticleError } from './handle-article-error';
import { makeDeleteArticleUseCase } from '../../../use-case/author/article/delete-article-use-case';
import { validateWithSchema } from '../../shared/validator/validator';
import { articleIdSchema } from '../schema/author-article-schema';
import { makeDeleteArticleById } from '@/infra/repository/article-ddb-repository';
export const deleteArticleHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const articleId = validateWithSchema(articleIdSchema, req.params);

  if (articleId.isErr()) {
    return res.status(404).send();
  }

  const input = {
    ...articleId.value,
  };

  const deleteArticleUseCase = makeDeleteArticleUseCase(
    makeDeleteArticleById(req.context.client),
  );

  return await deleteArticleUseCase(input).match(
    () => res.status(204).send(),
    (error: Error) => handleArticleError(res, error),
  );
};
