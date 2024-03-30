import { Request, Response } from 'express';
import { handleError } from './article-error-handler';
import { articleIdSchema, updateArticleSchema } from './schema';
import { makeUpdateArticleUseCase } from '../../use-case/update-article';
import createDynamoDBClient from '../../infra/support/dynamodb-client';
import { makeFindArticleById } from '../../infra/article-repository/find-article-by-id';
import { makeSaveArticle } from '../../infra/article-repository/save-article';
import { validateWithSchema } from '../support/validator';

export const updateArticleHandler = async (req: Request, res: Response) => {
  const articleId = validateWithSchema(articleIdSchema, req.params);
  const body = validateWithSchema(updateArticleSchema, req.body);

  if (articleId.isErr() || body.isErr()) {
    return res.status(400).send();
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
