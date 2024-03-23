import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { v4 as uuidv4 } from 'uuid';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SaveArticle } from '../../../domain/interface/repository';

const TABLE_NAME = process.env.TABLE_NAME;
export const makeSaveArticle = (client: DynamoDBClient) => {
  const saveArticle: SaveArticle = (model) => {
    console.log(TABLE_NAME);
    const articleId = model.articleId ? model.articleId : uuidv4();
    const article = {
      ...model,
      articleId: articleId,
      createdAt: new Date().toISOString(), // 既存のレコードがある場合の扱いを考慮する場所
      updatedAt: new Date().toISOString(),
    };

    const marshalledArticle = marshall(article);

    return ResultAsync.fromPromise(
      client
        .send(
          new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshalledArticle,
          }),
        )
        .then(() => article),
      (error: any) =>
        new Error('Failed to save the blog article: ' + error.message),
    );
  };

  return saveArticle;
};
