import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { DeleteArticleById } from '../../domain/article/interface/repository';

export const makeDeleteArticleById = (client: DynamoDBClient) => {
  const deleteArticleById: DeleteArticleById = ({ authorId, articleId }) => {
    const TABLE_NAME = process.env.TABLE_NAME;

    return ResultAsync.fromPromise(
      client
        .send(
          new DeleteItemCommand({
            TableName: TABLE_NAME,
            Key: {
              authorId: { S: authorId },
              articleId: { S: articleId },
            },
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
