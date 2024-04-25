import { toTitle } from './article-title';


describe('toTitle', () => {
  test('有効なタイトルが与えられた場合、成功のResultを返す', () => {
    // given
    const title = 'Valid Title';

    // when
    const result = toTitle(title);

    // then
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(title);
  });

  test('タイトルの長さがバリデーション基準を満たさない場合、エラーを返す', () => {
    // given
    const title = '';

    // when
    const result = toTitle(title);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });

  test('タイトルに禁止語句が含まれている場合、エラーを返す', () => {
    // given
    const ngWord = 'NGWord1'
    const title = `${ngWord} Containing Title`;

    // when
    const result = toTitle(title);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });
});
