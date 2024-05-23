import { SavedArticle } from '../model/article';
import { ArticleBody } from '../model/article-body';
import { ArticleStatus } from '../model/article-status';
import { ArticleTitle } from '../model/article-title';
import {
  ArticleNotPublishedError,
  ContainsForbiddenWordsError,
  InvalidLengthError,
  validatePublishedArticle,
  validateLength,
  validateNoNgWords,
} from './article-service';

describe('filterPublishedArticle', () => {
  test('公開された記事が与えられた場合、その記事を返す', () => {
    // given
    const article: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: ArticleStatus.Published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // when
    const result = validatePublishedArticle(article);

    // then
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(article);
  });

  test('非公開の記事が与えられた場合、エラーを返す', () => {
    // given
    const article: SavedArticle = {
      articleId: '1',
      authorId: 'author1',
      title: 'Original Title' as ArticleTitle,
      body: 'Original Body' as ArticleBody,
      status: ArticleStatus.Draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // when
    const result = validatePublishedArticle(article);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ArticleNotPublishedError);
  });
});

describe('validateLength', () => {
  const minLength = 1;
  const maxLength = 10;

  test('指定された範囲内の文字列長が与えられた場合、バリデーションを通過する', () => {
    // given
    const validStringLength = Math.floor((minLength + maxLength) / 2); // minLengthとmaxLengthの中間値を使用
    const validString = 'a'.repeat(validStringLength);

    // when
    const result = validateLength(minLength, maxLength)(validString);

    // then
    expect(result.isOk()).toBe(true);
  });

  test('指定された最小値より短い文字列が与えられた場合、エラーを返す', () => {
    // given
    const tooShortString = '';

    // when
    const result = validateLength(minLength, maxLength)(tooShortString);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(InvalidLengthError);
  });

  test('指定された最大値より長い文字列が与えられた場合、エラーを返す', () => {
    // given
    const tooLongString = 'a'.repeat(maxLength + 1);

    // when
    const result = validateLength(minLength, maxLength)(tooLongString);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(InvalidLengthError);
  });
});

describe('validateNoNgWords', () => {
  test('禁止語句を含まない文字列が与えられた場合、バリデーションを通過する', () => {
    // given
    const cleanString = 'Clean content';

    // when
    const result = validateNoNgWords(cleanString);

    // then
    expect(result.isOk()).toBe(true);
  });

  test('禁止語句を含む文字列が与えられた場合、エラーを返す', () => {
    // given
    const stringWithNgWord = 'This contains NGWord1';

    // when
    const result = validateNoNgWords(stringWithNgWord);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      ContainsForbiddenWordsError,
    );
  });
});
