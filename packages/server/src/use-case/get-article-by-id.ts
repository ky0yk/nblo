import { ArticleId, SavedArticle } from '../domain/model/article';
import { makeFindArticleById } from '../infra/repository/article/find-article-by-id';
import createDynamoDBClient from '../infra/client/dynamodb-client';
import { ResultAsync } from 'neverthrow';
import { filterPublishedArticle } from '../domain/services/article-service';

export const getArticleById = (
  articleId: ArticleId,
): ResultAsync<SavedArticle, Error> => {
  const client = createDynamoDBClient();
  const findArticleById = makeFindArticleById(client);

  return findArticleById(articleId).andThen(filterPublishedArticle);
};
