import { Result } from 'neverthrow';
import { ValidatedArticle } from '../model/article';
import { ArticleStatus, ToArticleStatus } from '../model/article-status';
import { ToTitle} from '../model/article-title';
import { ToBody} from '../model/article-body';

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
    status: status ?? ArticleStatus.Draft,
  };
};

export type CreateArticle = (cmd: CreateArticleCommand) => Result<ValidatedArticle, Error>;

export const makeCreateArticle = (
  toTitle: ToTitle,
  toBody: ToBody,
  toArticleStatus: ToArticleStatus
) => {
  const createArticle: CreateArticle = (cmd) => {
    const statusResult = toArticleStatus(cmd.status || ArticleStatus.Draft);
    const titleResult = toTitle(cmd.title);
    const bodyResult = toBody(cmd.body);

    return Result.combine([titleResult, bodyResult, statusResult]).map(
      ([title, body, status]) => ({
        authorId: cmd.authorId,
        title,
        body,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  };

  return createArticle;
};
