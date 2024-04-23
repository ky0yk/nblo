
import { DeleteCommandInput } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { DeleteArticleById, FindArticleById, SaveArticle } from '@/domain/article/interface/article-repository';
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDbResultClient } from '../client/dynamodb-result-client';
import { SavedArticle } from '@/domain/article/model/article';
import { errAsync, okAsync } from 'neverthrow';


export const makeSaveArticle = (ddbResultClient: DynamoDbResultClient) => {
  const saveArticle: SaveArticle = (model) => {
    const TABLE_NAME = process.env.TABLE_NAME || 'Articles';

    const articleId = model.articleId ? model.articleId : uuidv4();
    const article = {
      ...model,
      articleId,
      createdAt: model.createdAt ? model.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const input: PutCommandInput = {
      TableName: TABLE_NAME,
      Item: article,
    };

    return ddbResultClient
      .putItem(input)
      .map(() => article)
      .mapErr(
        (error) =>
          new Error('Failed to save the blog article: ' + error.message),
      );
  };

  return saveArticle;
};

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
      .andThen((queryOutput) => {
        if (!queryOutput.Items || queryOutput.Items.length === 0) {
          return errAsync(new Error());
        }
        return okAsync(unmarshall(queryOutput.Items[0]) as SavedArticle);
      })
  };

  return findArticleById;
};


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