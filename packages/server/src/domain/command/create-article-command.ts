import { Result } from 'neverthrow';

import { ValidatedArticle } from '../model/article';
import { toArticleStatus } from '../model/article-status';
import { toTitle } from '../model/article-title';
import { toBody } from '../model/article-body';

export interface CreateArticleCommand {
  authorId: string;
  title: string;
  body: string;
  status?: string;
}

export const toCreateArticleCommand = (
  authorId: string,
  title: string,
  body: string,
  status?: string,
): CreateArticleCommand => {
  return {
    authorId,
    title,
    body,
    status,
  };
};

export const createArticle = (
  cmd: CreateArticleCommand,
): Result<ValidatedArticle, Error> => {
  const statusResult = toArticleStatus(cmd.status || 'Draft');
  const titleResult = toTitle(cmd.title);
  const bodyResult = toBody(cmd.body);

  return Result.combine([titleResult, bodyResult, statusResult]).map(
    ([title, body, status]) => ({
      authorId: cmd.authorId,
      title: title,
      body: body,
      status: status,
    }),
  );
};
