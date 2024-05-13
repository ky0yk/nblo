import { Result } from 'neverthrow';
import { validateLength, validateNoNgWords } from '../service/article-service';

export type ArticleTitle = string & { readonly brand: unique symbol };

const MIN_CHARACTER = 3;
const MAX_CHARACTER = 100;

export type ToTitle = (title: string) => Result<ArticleTitle, Error>;

export const toTitle: ToTitle = (title) => {
  const validateLengthRange = validateLength(MIN_CHARACTER, MAX_CHARACTER);

  return validateLengthRange(title)
    .andThen(() => validateNoNgWords(title))
    .map(() => title as ArticleTitle);
};
