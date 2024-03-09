import { Result } from 'neverthrow';
import { isValidArticleStatus, toBody, toTitle } from '../model/validators';
import { ArticleStatus, ValidatedArticle } from '../model/article';

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
  const status = isValidArticleStatus(cmd.status || 'Draft')
    ? (cmd.status as ArticleStatus)
    : ArticleStatus.Draft;

  const title = toTitle(cmd.title);
  const body = toBody(cmd.body);

  return Result.combine([title, body]).map(
    ([validatedTitle, validatedBody]) => ({
      authorId: cmd.authorId,
      title: validatedTitle,
      body: validatedBody,
      status: status,
    }),
  );
};
