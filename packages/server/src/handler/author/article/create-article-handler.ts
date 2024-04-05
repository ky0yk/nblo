import { Request, Response } from 'express';
import { handleArticleError } from './handle-artilce-error';
import { makeCreateArticleUseCase } from '../../../use-case/author/article/create-article-use-case';
import { makeSaveArticle } from '../../../infra/repository/article-ddb-repository/save-article';
import { validateWithSchema } from '../../shared/validator/validator';
import { createArticleSchema } from '../schema/author-article-schema';

export const createArticleHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const body = validateWithSchema(createArticleSchema, req.body);

  if (body.isErr()) {
    return res.status(400).json(body.error.message);
  }

  const input = {
    ...body.value,
  };

  const createArticleUseCase = makeCreateArticleUseCase(
    makeSaveArticle(req.context.client),
  );

  return await createArticleUseCase(input).match(
    (article) => res.status(201).json(article),
    (error: Error) => handleArticleError(res, error),
  );
};
