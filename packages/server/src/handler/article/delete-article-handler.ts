import { Request, Response } from 'express';
import { handleArticleError } from './handle-artilce-error';
import { makeDeleteArticleUseCase } from '../../use-case/delete-article-use-case';
import { makeDeleteArticleById } from '../../infra/article-repository/delete-article-by-id';
import { validateWithSchema } from '../support/validator';
import { articleIdSchema } from './schema/article-schema';
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
    (_) => res.status(204).send(),
    (error: Error) => handleArticleError(res, error),
  );
};
