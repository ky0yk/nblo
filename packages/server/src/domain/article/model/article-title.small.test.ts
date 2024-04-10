import { validateLength, validateNoNgWords } from '../service/article-service';
import { toTitle } from './article-title';
import {
  resetArticleServiceMocks,
  setValidateLengthError,
  setValidateNoNgWordsError,
} from '../service/article-service.mock';

jest.mock('../service/article-service');

beforeEach(() => {
  resetArticleServiceMocks();
});

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
    setValidateLengthError();
    const title = 'aaaaa';

    // when
    const result = toTitle(title);

    // then
    expect(validateNoNgWords).not.toHaveBeenCalled();

    expect(result.isErr()).toBe(true);
    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid length');
  });

  test('タイトルに禁止語句が含まれている場合、エラーを返す', () => {
    // given
    setValidateNoNgWordsError();
    const title = 'NGWord Containing Title';

    // when
    const result = toTitle(title);

    // then
    expect(validateLength).toHaveBeenCalledTimes(1);

    expect(result.isErr()).toBe(true);

    const error = result._unsafeUnwrapErr();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Contains forbidden words');
  });
});
