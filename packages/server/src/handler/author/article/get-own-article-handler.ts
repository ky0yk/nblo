import { Request, Response } from 'express';
import { makeGetOwnArticleUseCase } from '../../../use-case/author/article/get-own-article-use-case';
import { handleArticleError } from './handle-artilce-error';
import { articleIdSchema } from '../schema/author-article-schema';
import { makeFindArticleById } from '../../../infra/repository/article-ddb-repository/find-article-by-id';
import { validateWithSchema } from '../../shared/validator/validator';

export const getOwnArticleHandler = async (
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

  const getArticleByIdUseCase = makeGetOwnArticleUseCase(
    makeFindArticleById(req.context.client),
  );

  return await getArticleByIdUseCase(input).match(
    (article) => res.status(200).json(article),
    (error: Error) => handleArticleError(res, error),
  );
};
