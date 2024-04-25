import { Request, Response } from 'express';
import { handleArticleError } from '../../author/article/handle-article-error';
import { articleIdSchema } from '../../author/schema/author-article-schema';
import { validateWithSchema } from '../../shared/validator/validator';
import { makeGetPublicArticleUseCase } from '@/use-case/visitor/article/get-public-article-use-case';
import { makeFindArticleById } from '@/infra/repository/article-ddb-repository';
import { validatePublishedArticle } from '@/domain/article/service/article-service';

export const getPublicArticleHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const articleId = validateWithSchema(articleIdSchema, req.params);

  if (articleId.isErr()) {
    return res.status(400).json(articleId.error.message);
  }

  const input = {
    ...articleId.value,
  };

  const getPublicArticleUseCase = makeGetPublicArticleUseCase(
    validatePublishedArticle,
    makeFindArticleById(req.context.client),
  );

  return await getPublicArticleUseCase(input).match(
    (article) => res.status(200).json(article),
    (error: Error) => handleArticleError(res, error),
  );
};
