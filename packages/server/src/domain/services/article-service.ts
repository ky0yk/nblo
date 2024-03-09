import { Result, err, ok } from 'neverthrow';
import { ArticleStatus, SavedArticle } from '../model/article';

export const filterPublishedArticle = (
  article: SavedArticle,
): Result<SavedArticle, Error> => {
  return article.status === ArticleStatus.Published
    ? ok(article)
    : err(new Error('Article is not published'));
};
