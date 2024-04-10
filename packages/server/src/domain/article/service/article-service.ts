import { Result, err, ok } from 'neverthrow';
import { SavedArticle } from '../model/article';
import { ArticleStatus } from '../model/article-status';

export class ArticleNotPublishedError extends Error {}
export class InvalidLengthError extends Error {}
export class ContainsForbiddenWordsError extends Error {}

export const filterPublishedArticle = (
  article: SavedArticle,
): Result<SavedArticle, Error> => {
  return article.status === ArticleStatus.Published
    ? ok(article)
    : err(new ArticleNotPublishedError('Article is not published'));
};

const ngWords = ['NGWord1', 'NGWord2']; // 仮のNGワードリスト

export const validateLength =
  (min: number, max: number) =>
  (value: string): Result<void, Error> => {
    return value.length < min || value.length > max
      ? err(
          new InvalidLengthError(
            `Length must be between ${min} and ${max} characters.`,
          ),
        )
      : ok(undefined);
  };

export const validateNoNgWords = (value: string): Result<void, Error> => {
  return ngWords.some((ngWord) => value.includes(ngWord))
    ? err(new ContainsForbiddenWordsError(`Contains forbidden words.`))
    : ok(undefined);
};
