import { Result, err, ok } from 'neverthrow';
import { SavedArticle, ValidatedArticle } from '../model/article';
import { ToTitle } from '../model/article-title';
import { ToBody } from '../model/article-body';
import { ValidStatusTransition } from '../model/article-status';

export class UpdateDataEmptyError extends Error {}

export interface UpdateArticleCommand {
  article: SavedArticle;
  update: {
    title?: string;
    body?: string;
    status?: string;
  };
}

export const toUpdateArticleCommand = (
  article: SavedArticle,
  update: {
    title?: string;
    body?: string;
    status?: string;
  },
): UpdateArticleCommand => {
  return {
    article,
    update,
  };
};

const isUpdateEmpty = (update: UpdateArticleCommand['update']): boolean => {
  return Object.keys(update).length === 0;
};

export type UpdateArticle = (
  cmd: UpdateArticleCommand,
) => Result<ValidatedArticle, Error>;

export const makeUpdateArticle = (
  toTitle: ToTitle,
  toBody: ToBody,
  validStatusTransition: ValidStatusTransition,
) => {
  const updateArticle: UpdateArticle = (cmd) => {
    if (isUpdateEmpty(cmd.update)) {
      return err(new UpdateDataEmptyError('Update data is empty'));
    }
    const { title: newTitle, body: newBody, status: newStatus } = cmd.update;
    const { title: oldTitle, body: oldBody, status: oldStatus } = cmd.article;

    const titleResult = newTitle ? toTitle(newTitle) : ok(oldTitle);
    const bodyResult = newBody ? toBody(newBody) : ok(oldBody);
    const statusResult = newStatus
      ? validStatusTransition(oldStatus, newStatus)
      : ok(oldStatus);

    return Result.combine([titleResult, bodyResult, statusResult]).map(
      ([title, body, status]) => ({
        ...cmd.article,
        title,
        body,
        status,
        updatedAt: new Date().toISOString(),
      }),
    );
  };

  return updateArticle;
};
