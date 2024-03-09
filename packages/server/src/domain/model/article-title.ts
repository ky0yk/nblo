import { Result } from 'neverthrow';
import { validateLength, validateNoNgWords } from '../services/article-service';

export type ArticleTitle = string & { readonly brand: unique symbol };

const MIN_CHARACTER = 3;
const MAX_CHARACTER = 100;

export const toTitle = (title: string): Result<ArticleTitle, Error> => {
  const validateLengthRange = validateLength(MIN_CHARACTER, MAX_CHARACTER);

  return validateLengthRange(title)
    .andThen(() => validateNoNgWords(title))
    .mapErr(() => new Error(`Title validation Error`))
    .map(() => title as ArticleTitle);
};
