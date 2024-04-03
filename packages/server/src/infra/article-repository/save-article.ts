import { v4 as uuidv4 } from 'uuid';
import { PutCommandInput } from '@aws-sdk/lib-dynamodb';

import { SaveArticle } from '@/domain/article/interface/repository';
import { DynamoDbResultClient } from '../support/dynamodb-result-client';

export const makeSaveArticle = (ddbResultClient: DynamoDbResultClient) => {
  const saveArticle: SaveArticle = (model) => {
    const TABLE_NAME = process.env.TABLE_NAME || 'Articles';

    const articleId = model.articleId ? model.articleId : uuidv4();
    const article = {
      ...model,
      articleId,
      createdAt: new Date().toISOString(),
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
