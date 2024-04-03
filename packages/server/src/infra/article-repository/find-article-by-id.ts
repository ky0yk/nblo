import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { SavedArticle } from '../../domain/article/model/article';
import { FindArticleById } from '../../domain/article/interface/repository';
import { DynamoDbResultClient } from '../support/dynamodb-result-client';

export const makeFindArticleById = (client: DynamoDbResultClient) => {
  const findArticleById: FindArticleById = (articleId) => {
    const TABLE_NAME = process.env.TABLE_NAME;
    const GSI_NAME = 'ArticleIdIndex';

    const MAX_QUERY_LIMIT = 10;

    const input: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'articleId = :articleId',
      ExpressionAttributeValues: {
        ':articleId': { S: articleId },
      },
    };

    return client
      .queryRecursively(input, MAX_QUERY_LIMIT)
      .map((queryOutput) => {
        if (!queryOutput.Items || queryOutput.Items.length === 0) {
          throw new Error('Article not found');
        }
        return unmarshall(queryOutput.Items[0]) as SavedArticle;
      })
      .mapErr(
        (error) =>
          new Error(
            `Failed to get the article: ${error.message || error.toString()}`,
          ),
      );
  };

  return findArticleById;
};
