import { Request, Response, NextFunction } from 'express';
import { handleError } from './article-error-handler';
import { makeCreateArticleUseCase } from '../../use-case/create-article-use-case';
import { createArticleSchema } from './schema';
import { makeSaveArticle } from '../../infra/article-repository/save-article';
import createDynamoDBClient from '../../infra/support/dynamodb-client';
import { validateWithSchema } from '../support/validator';

export const createArticleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.body);
  const body = validateWithSchema(createArticleSchema, req.body);
  console.log(body);

  if (body.isErr()) {
    return res.status(400).json(body.error.message);
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
