import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ArticleId } from '../../../domain/model/article';

const TABLE_NAME = 'Posts';

export const makeDeleteArticleById = (client: DynamoDBClient) => {
  return (articleId: ArticleId): ResultAsync<void, Error> => {
    return ResultAsync.fromPromise(
      client
        .send(
          new DeleteItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ articleId: articleId }),
          }),
        )
        .then(() => void 0),
      (error: any) =>
        new Error(
          'Failed to delete the article: ' +
            (error.message || error.toString()),
        ),
    );
  };
};
