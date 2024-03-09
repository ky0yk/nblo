import { Result } from 'neverthrow';
import { validateLength, validateNoNgWords } from '../services/article-service';

export type ArticleBody = string & { readonly brand: unique symbol };

const MIN_CHARACTER = 1;
const MAX_CHARACTER = 10000;

export const toBody = (body: string): Result<ArticleBody, Error> => {
  const validateLengthRange = validateLength(MIN_CHARACTER, MAX_CHARACTER);

  return validateLengthRange(body)
    .andThen(() => validateNoNgWords(body))
    .mapErr(() => new Error(`Body validation Error`))
    .map(() => body as ArticleBody);
};
