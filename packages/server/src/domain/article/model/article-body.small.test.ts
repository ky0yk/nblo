import { toBody, ArticleBody } from './article-body';

describe('toTitle', () => {
  test('有効な本文が与えられた場合、成功のResultを返す', () => {
    // given
    const body = 'Valid Body Content';

    // when
    const result = toBody(body);

    // then
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(body as ArticleBody);
  });

  test('本文の長さがバリデーション基準を満たさない場合、エラーを返す', () => {
    // given
    const body = '';

    // when
    const result = toBody(body);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });

  test('本文に禁止語句が含まれている場合、エラーを返す', () => {
    // given
    const body = 'This contains NGWord1.';

    // when
    const result = toBody(body);

    // then
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });
});
