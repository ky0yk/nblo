import { Request, Response } from 'express';
import { handleArticleError } from './handle-artilce-error';
import { makeUpdateArticleUseCase } from '../../use-case/update-article';
import { makeFindArticleById } from '../../infra/article-repository/find-article-by-id';
import { makeSaveArticle } from '../../infra/article-repository/save-article';
import { validateWithSchema } from '../support/validator';
import { articleIdSchema, updateArticleSchema } from './schema/article-schema';

export const updateArticleHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const articleId = validateWithSchema(articleIdSchema, req.params);
  const body = validateWithSchema(updateArticleSchema, req.body);

  const client = req.context.client;

  if (articleId.isErr() || body.isErr()) {
    return res.status(400).send();
  }

  const input = {
    ...articleId.value,
    update: body.value,
  };

  const updateArticleUseCase = makeUpdateArticleUseCase(
    makeFindArticleById(client),
    makeSaveArticle(client),
  );

  return await updateArticleUseCase(input).match(
    (article) => res.status(200).json(article),
    (error: Error) => handleArticleError(res, error),
  );
};
