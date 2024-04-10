import { Result, err, ok } from 'neverthrow';
import { SavedArticle, ValidatedArticle } from '../model/article';
import { toTitle } from '../model/article-title';
import { toBody } from '../model/article-body';
import { validStatusTransition } from '../model/article-status';

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

export const updateArticle = (
  cmd: UpdateArticleCommand,
): Result<ValidatedArticle, Error> => {
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

  const validationResult = Result.combine([
    titleResult,
    bodyResult,
    statusResult,
  ]).map(([title, body, status]) => ({
    ...cmd.article,
    title,
    body,
    status,
  }));

  return validationResult;
};
