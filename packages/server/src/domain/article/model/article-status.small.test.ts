import {
  InvalidArticleStatusError,
  InvalidStatusTransitionError,
  toArticleStatus,
  ArticleStatus,
  validStatusTransition,
} from './article-status';

describe('toArticleStatus', () => {
  test('有効な記事ステータスが与えられた場合、そのステータスを返す', () => {
    // given
    const validStatus = ArticleStatus.Published;

    // when
    const result = toArticleStatus(validStatus);

    // then
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(validStatus);
  });

  test('無効な記事ステータスが与えられた場合、InvalidArticleStatusErrorを返す', () => {
    // given
    const invalidStatus = 'dummy-status';

    // when
    const result = toArticleStatus(invalidStatus);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(InvalidArticleStatusError);
  });
});

describe('toValidStatus', () => {
  test('許可されたステータス遷移が与えられた場合、新しいステータスを返す', () => {
    // given
    const currentStatus = ArticleStatus.Draft;
    const newStatus = 'published';

    // when
    const result = validStatusTransition(currentStatus, newStatus);

    // then
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(ArticleStatus.Published);
  });

  test('許可されていないステータス遷移が与えられた場合、InvalidStatusTransitionErrorを返す', () => {
    // given
    const currentStatus = ArticleStatus.Draft;
    const newStatus = 'private'; // DraftからPrivateへの遷移は許可されていない

    // when
    const result = validStatusTransition(currentStatus, newStatus);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      InvalidStatusTransitionError,
    );
  });

  test('無効な新しいステータスが与えられた場合、InvalidArticleStatusErrorを返す', () => {
    // given
    const currentStatus = ArticleStatus.Draft;
    const newStatus = 'archived'; // 無効なステータス

    // when
    const result = validStatusTransition(currentStatus, newStatus);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(InvalidArticleStatusError);
  });
});
