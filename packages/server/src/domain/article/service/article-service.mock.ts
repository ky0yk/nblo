import { validateLength, validateNoNgWords } from '../service/article-service';
import { ok, err } from 'neverthrow';

const mockValidateLength = validateLength as jest.Mock;
const mockValidateNoNgWords = validateNoNgWords as jest.Mock;

export const resetArticleServiceMocks = () => {
  mockValidateLength
    .mockReset()
    .mockImplementation(() => jest.fn(() => ok(undefined)));
  mockValidateNoNgWords.mockReset().mockImplementation(() => ok(undefined));
};

export const setValidateLengthError = () => {
  mockValidateLength.mockImplementation(() =>
    jest.fn(() => err(new Error('Invalid length'))),
  );
};

export const setValidateNoNgWordsError = () => {
  mockValidateNoNgWords.mockImplementation(() =>
    err(new Error('Contains forbidden words')),
  );
};
