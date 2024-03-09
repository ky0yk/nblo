import { Result, err, ok } from 'neverthrow';
import {
  ArticleStatus,
  SavedArticle,
  ValidatedArticle,
} from '../model/article';
import { toBody, toTitle, toValidStatus } from '../model/validators';

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
    return err(new Error('Update data is empty'));
  }

  const titleResult = cmd.update.title
    ? toTitle(cmd.update.title)
    : ok(cmd.article.title);
  const bodyResult = cmd.update.body
    ? toBody(cmd.update.body)
    : ok(cmd.article.body);
  const statusResult = cmd.update.status
    ? toValidStatus(cmd.article.status, cmd.update.status)
    : ok(cmd.article.status);

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
