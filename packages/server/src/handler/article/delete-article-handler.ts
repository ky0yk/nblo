import { Request, Response, NextFunction } from 'express';
import { handleError } from './article-error-handler';
import { makeDeleteArticleUseCase } from '../../use-case/delete-article-use-case';
import { articleIdSchema } from './schema';
import createDynamoDBClient from '../../infra/client/dynamodb-client';
import { makeDeleteArticleById } from '../../infra/ddb-repository/article/delete-article-by-id';
import { validateWithSchema } from '../validator';

export const deleteArticleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const articleId = validateWithSchema(articleIdSchema, req.params);

  if (articleId.isErr()) {
    return;
  }

  const input = {
    ...articleId.value,
  };

  const client = createDynamoDBClient();
  const deleteArticleUseCase = makeDeleteArticleUseCase(
    makeDeleteArticleById(client),
  );

  return await deleteArticleUseCase(input).match(
    (_) => res.status(204).send(),
    (error: Error) => handleError(error),
  );
};
