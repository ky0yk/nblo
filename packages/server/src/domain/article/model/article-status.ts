import { Result, err, ok } from 'neverthrow';

export class InvalidArticleStatusError extends Error {}
export class InvalidStatusTransitionError extends Error {}

export const ArticleStatus = {
  Draft: 'draft', // 下書き
  Published: 'published', // 公開済み
  Private: 'private', // 非公開
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export type ToArticleStatus = (value: string) => Result<ArticleStatus, Error>;

export const toArticleStatus: ToArticleStatus = (value) =>
  Object.values(ArticleStatus).includes(value as ArticleStatus)
    ? ok(value as ArticleStatus)
    : err(new InvalidArticleStatusError('Invalid article status'));

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

export type ValidStatusTransition = (
  currentStatus: ArticleStatus,
  newStatusInput: string,
) => Result<ArticleStatus, Error>;

export const validStatusTransition: ValidStatusTransition = (
  currentStatus,
  newStatusInput,
) => {
  const newStatusResult = toArticleStatus(newStatusInput);

  return newStatusResult.andThen((newStatus) => {
    if (!canChangeStatus(currentStatus, newStatus)) {
      return err(new InvalidStatusTransitionError('Invalid status transition'));
    }

    return ok(newStatus);
  });
};
