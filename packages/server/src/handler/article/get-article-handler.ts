import { Request, Response } from 'express';
import { makeGetArticleUseCase } from '../../use-case/get-article-use-case';
import { handleError } from './article-error-handler';
import { articleIdSchema } from './schema';
import createDynamoDBClient from '../../infra/support/dynamodb-client';
import { makeFindArticleById } from '../../infra/article-repository/find-article-by-id';
import { validateWithSchema } from '../support/validator';

export const getArticleHandler = async (req: Request, res: Response) => {
  const articleId = validateWithSchema(articleIdSchema, req.params);

  if (articleId.isErr()) {
    return res.status(400).json(articleId.error.message);
  }

  const input = {
    ...articleId.value,
  };

  const client = createDynamoDBClient();
  const getArticleByIdUseCase = makeGetArticleUseCase(
    makeFindArticleById(client),
  );

  return await getArticleByIdUseCase(input).match(
    (article) => res.status(200).json(article),
    (error: Error) => handleError(error),
  );
};
