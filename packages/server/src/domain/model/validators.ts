import { Result, err, ok } from 'neverthrow';
import { ArticleBody, ArticleStatus, ArticleTitle } from './article';

export const toTitle = (title: string): Result<ArticleTitle, Error> => {
  const validateLengthRange = validateLength(3, 100);

  return validateLengthRange(title)
    .andThen(() => validateNoNgWords(title))
    .mapErr(() => new Error(`Title validation Error`))
    .map(() => title as ArticleTitle);
};

export const toBody = (body: string): Result<ArticleBody, Error> => {
  const validateLengthRange = validateLength(1, 10000);

  return validateLengthRange(body)
    .andThen(() => validateNoNgWords(body))
    .mapErr(() => new Error(`Body validation Error`))
    .map(() => body as ArticleBody);
};

const ngWords = ['NGWord1', 'NGWord2']; // 仮のNGワードリスト

const validateLength =
  (min: number, max: number) =>
  (value: string): Result<void, Error> => {
    return value.length < min || value.length > max
      ? err(new Error(`Length must be between ${min} and ${max} characters.`))
      : ok(undefined);
  };

const validateNoNgWords = (value: string): Result<void, Error> => {
  return ngWords.some((ngWord) => value.includes(ngWord))
    ? err(new Error(`Contains forbidden words.`))
    : ok(undefined);
};

const toArticleStatus = (value: string): Result<ArticleStatus, Error> =>
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
