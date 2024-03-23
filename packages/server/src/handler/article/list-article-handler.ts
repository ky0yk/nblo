import { Request, Response, NextFunction } from 'express';
import { listArticlesUseCase } from '../../use-case/list-articles-use-case';
import { handleError } from './article-error-handler';

export const listArticlesHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO zodでスキーマチェック
  const queryParams = {};

  return listArticlesUseCase(queryParams).match(
    (articles) => res.status(200).json(articles),
    (error: Error) => handleError(error),
  );
};
