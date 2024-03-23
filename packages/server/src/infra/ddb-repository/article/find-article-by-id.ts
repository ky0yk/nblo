import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SavedArticle } from '../../../domain/model/article';
import { FindArticleById } from '../../../domain/interface/repository';

const TABLE_NAME = process.env.TABLE_NAME;

export const makeFindArticleById = (client: DynamoDBClient) => {
  const findArticleById: FindArticleById = (articleId) => {
    return ResultAsync.fromPromise(
      client
        .send(
          new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({ articleId: articleId }),
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
