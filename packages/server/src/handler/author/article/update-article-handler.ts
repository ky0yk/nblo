import { Request, Response } from 'express';
import { handleArticleError } from './handle-article-error';
import { makeUpdateArticleUseCase } from '../../../use-case/author/article/update-article';
import { validateWithSchema } from '../../shared/validator/validator';
import {
  articleIdSchema,
  updateArticleSchema,
} from '../schema/author-article-schema';
import { makeUpdateArticle } from '@/domain/article/command/update-article-command';
import {
  makeFindArticleById,
  makeSaveArticle,
} from '@/infra/repository/article-ddb-repository';
import { toTitle } from '@/domain/article/model/article-title';
import { toBody } from '@/domain/article/model/article-body';
import { validStatusTransition } from '@/domain/article/model/article-status';

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

  const updateArticle = makeUpdateArticle(
    toTitle,
    toBody,
    validStatusTransition,
  );

  const updateArticleUseCase = makeUpdateArticleUseCase(
    updateArticle,
    makeFindArticleById(client),
    makeSaveArticle(client),
  );

  return await updateArticleUseCase(input).match(
    (article) => res.status(200).json(article),
    (error: Error) => handleArticleError(res, error),
  );
};
