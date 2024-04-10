jest.mock('../service/article-service');

import { validateLength, validateNoNgWords } from '../service/article-service';
import { toBody, ArticleBody } from './article-body';
import {
  resetArticleServiceMocks,
  setValidateLengthError,
  setValidateNoNgWordsError,
} from '../service/article-service.mock';

describe('toBody', () => {
  beforeEach(() => {
    resetArticleServiceMocks();
  });

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
    setValidateLengthError();
    const body = '';

    // when
    const result = toBody(body);

    // then
    expect(validateNoNgWords).not.toHaveBeenCalled();

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid length');
  });

  test('本文に禁止語句が含まれている場合、エラーを返す', () => {
    // given
    setValidateNoNgWordsError();
    const body = 'This contains NGWord1.';

    // when
    const result = toBody(body);

    // then
    expect(validateLength).toHaveBeenCalledTimes(1);

    expect(result.isErr()).toBe(true);

    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Contains forbidden words');
  });
});
