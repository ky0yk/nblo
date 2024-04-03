import { DeleteArticleById } from '../../domain/article/interface/repository';
import { DynamoDbResultClient } from '../support/dynamodb-result-client';
import { DeleteCommandInput } from '@aws-sdk/lib-dynamodb';

export const makeDeleteArticleById = (
  ddbResultClient: DynamoDbResultClient,
) => {
  const deleteArticleById: DeleteArticleById = ({ authorId, articleId }) => {
    const TABLE_NAME = process.env.TABLE_NAME;

    const input: DeleteCommandInput = {
      TableName: TABLE_NAME,
      Key: {
        authorId: authorId,
        articleId: articleId,
      },
    };

    return ddbResultClient
      .deleteItem(input)
      .map(() => {})
      .mapErr(
        (error) => new Error(`Failed to delete the article: ${error.message}`),
      );
  };

  return deleteArticleById;
};
