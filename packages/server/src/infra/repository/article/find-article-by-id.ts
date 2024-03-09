import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { ResultAsync, err, ok } from 'neverthrow';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ArticleId, SavedArticle } from '../../../domain/model/article';

const TABLE_NAME = 'Posts';

export const makeFindArticleById = (client: DynamoDBClient) => {
  const findArticleById = (
    articleId: ArticleId,
  ): ResultAsync<SavedArticle, Error> => {
    const key = marshall({ articleId: articleId });

    return ResultAsync.fromPromise(
      client
        .send(
          new GetItemCommand({
            TableName: TABLE_NAME,
            Key: key,
          }),
        )
        .then((response) => {
          if (!response.Item) {
            throw new Error('Article not found');
          }
          return unmarshall(response.Item) as SavedArticle;
        }),
      (error: any) =>
        new Error(
          `Failed to get the article: ${error.message || error.toString()}`,
        ),
    );
  };

  return findArticleById;
};
