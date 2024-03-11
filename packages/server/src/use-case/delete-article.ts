import { ArticleId } from '../domain/model/article';
import createDynamoDBClient from '../infra/client/dynamodb-client';
import { ResultAsync } from 'neverthrow';
import { makeDeleteArticleById } from '../infra/repository/article/delete-article-by-id';

export const deleteArticleById = (
  articleId: ArticleId,
): ResultAsync<void, Error> => {
  const client = createDynamoDBClient();
  const deleteArticleById = makeDeleteArticleById(client);

  return deleteArticleById(articleId);
};
