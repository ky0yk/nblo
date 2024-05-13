import { Result } from 'neverthrow';
import { validateLength, validateNoNgWords } from '../service/article-service';

export type ArticleBody = string & { readonly brand: unique symbol };

const MIN_CHARACTER = 1;
const MAX_CHARACTER = 10000;

export type ToBody = (body: string) => Result<ArticleBody, Error>;

export const toBody: ToBody = (body) => {
  const validateLengthRange = validateLength(MIN_CHARACTER, MAX_CHARACTER);

  return validateLengthRange(body)
    .andThen(() => validateNoNgWords(body))
    .map(() => body as ArticleBody);
};
