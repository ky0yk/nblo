import { Result, err, ok } from 'neverthrow';

export const ArticleStatus = {
  Draft: 'draft', // 下書き
  Published: 'published', // 公開済み
  Private: 'private', // 非公開
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const toArticleStatus = (value: string): Result<ArticleStatus, Error> =>
  Object.values(ArticleStatus).includes(value as ArticleStatus)
    ? ok(value as ArticleStatus)
    : err(new Error('Invalid article status'));

const canChangeStatus = (
  currentStatus: ArticleStatus,
  newStatus: ArticleStatus,
): boolean => {
  const allowedTransitions: { [K in ArticleStatus]?: ArticleStatus[] } = {
    [ArticleStatus.Draft]: [ArticleStatus.Published],
    [ArticleStatus.Published]: [ArticleStatus.Private],
    [ArticleStatus.Private]: [ArticleStatus.Published],
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
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
