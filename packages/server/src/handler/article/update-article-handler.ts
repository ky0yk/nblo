import { Request, Response, NextFunction } from 'express';
import { handleError } from './article-error-handler';
import { articleIdSchema, updateArticleSchema } from './schema';
import { makeUpdateArticleUseCase } from '../../use-case/update-article';
import createDynamoDBClient from '../../infra/client/dynamodb-client';
import { makeFindArticleById } from '../../infra/ddb-repository/article/find-article-by-id';
import { makeSaveArticle } from '../../infra/ddb-repository/article/save-article';
import { validateWithSchema } from '../validator';

export const updateArticleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const articleId = validateWithSchema(articleIdSchema, req.params);
  const body = validateWithSchema(updateArticleSchema, req.body);

  if (articleId.isErr() || body.isErr()) {
    return;
  }

  const input = {
    ...articleId.value,
    update: body.value,
  };

  const client = createDynamoDBClient();
  const updateArticleUseCase = makeUpdateArticleUseCase(
    makeFindArticleById(client),
    makeSaveArticle(client),
  );

  return await updateArticleUseCase(input).match(
    (article) => res.status(201).json(article),
    (error: Error) => handleError(error),
  );
};
