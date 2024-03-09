import { Result, err, ok } from 'neverthrow';

export enum ArticleStatus {
  Draft = 'draft',
  Published = 'published',
  Private = 'private',
}

export const toArticleStatus = (value: string): Result<ArticleStatus, Error> =>
  Object.values(ArticleStatus).includes(value as ArticleStatus)
    ? ok(value as ArticleStatus)
    : err(new Error('Invalid article status'));

const canChangeStatus = (
  currentStatus: ArticleStatus,
  newStatus: ArticleStatus,
): boolean => {
  //NOTE: 一度「公開済み」になった記事は、「下書き」に戻すことができない
  const allowedTransitions = {
    [ArticleStatus.Draft]: [ArticleStatus.Published],
    [ArticleStatus.Published]: [ArticleStatus.Private],
    [ArticleStatus.Private]: [ArticleStatus.Published],
  };

  return allowedTransitions[currentStatus].includes(newStatus);
};

export const toValidStatus = (
  currentStatus: ArticleStatus,
  newStatusInput: string,
): Result<ArticleStatus, Error> => {
  const newStatusResult = toArticleStatus(newStatusInput);

  return newStatusResult.andThen((newStatus) => {
    if (!canChangeStatus(currentStatus, newStatus)) {
      return err(new Error('Invalid status transition'));
    }

    return ok(newStatus);
  });
};
