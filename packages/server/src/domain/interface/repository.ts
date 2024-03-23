import { ResultAsync } from 'neverthrow';
import { ArticleId, SavedArticle, ValidatedArticle } from '../model/article';

export type DeleteArticleById = (model: ArticleId) => ResultAsync<void, Error>;

export type FindArticleById = (
  model: ArticleId,
) => ResultAsync<SavedArticle, Error>;

export type SaveArticle = (
  model: ValidatedArticle,
) => ResultAsync<SavedArticle, Error>;
