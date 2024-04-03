import { Request, Response } from 'express';
import { makeGetArticleUseCase } from '../../use-case/get-article-use-case';
import { handleArticleError } from './handle-artilce-error';
import { articleIdSchema } from './schema/article-schema';
import { makeFindArticleById } from '../../infra/article-repository/find-article-by-id';
import { validateWithSchema } from '../support/validator';

export const getArticleHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const articleId = validateWithSchema(articleIdSchema, req.params);

  if (articleId.isErr()) {
    return res.status(400).json(articleId.error.message);
  }

  const input = {
    ...articleId.value,
  };

  const getArticleByIdUseCase = makeGetArticleUseCase(
    makeFindArticleById(req.context.client),
  );

  return await getArticleByIdUseCase(input).match(
    (article) => res.status(200).json(article),
    (error: Error) => handleArticleError(res, error),
  );
};
