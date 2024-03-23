import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ArticleId } from '../../../domain/model/article';
import { DeleteArticleById } from '../../../domain/interface/repository';

const TABLE_NAME = process.env.TABLE_NAME;

export const makeDeleteArticleById = (client: DynamoDBClient) => {
  const deleteArticleById: DeleteArticleById = (articleId) => {
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

  return deleteArticleById;
};
