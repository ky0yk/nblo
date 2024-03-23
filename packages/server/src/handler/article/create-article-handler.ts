import { Request, Response, NextFunction } from 'express';
import { handleError } from './article-error-handler';
import { makeCreateArticleUseCase } from '../../use-case/create-article-use-case';
import { createArticleSchema } from './schema';
import { makeSaveArticle } from '../../infra/ddb-repository/article/save-article';
import createDynamoDBClient from '../../infra/client/dynamodb-client';

export const createArticleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = validateWithSchema(createArticleSchema, req.body);

  if (body.isErr()) {
    return handleError(body.error);
  }

  const input = {
    ...body.value,
  };

  const client = createDynamoDBClient();
  const createArticleUseCase = makeCreateArticleUseCase(
    makeSaveArticle(client),
  );

  return await createArticleUseCase(input).match(
    (article) => res.status(201).json(article),
    (error: Error) => handleError(error),
  );
};
