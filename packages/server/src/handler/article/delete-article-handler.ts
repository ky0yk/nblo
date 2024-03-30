import { Request, Response } from 'express';
import { handleError } from './article-error-handler';
import { makeDeleteArticleUseCase } from '../../use-case/delete-article-use-case';
import { articleIdSchema } from './schema';
import createDynamoDBClient from '../../infra/support/dynamodb-client';
import { makeDeleteArticleById } from '../../infra/article-repository/delete-article-by-id';
import { validateWithSchema } from '../support/validator';

export const deleteArticleHandler = async (req: Request, res: Response) => {
  const articleId = validateWithSchema(articleIdSchema, req.params);

  if (articleId.isErr()) {
    return res.status(404).send();
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
