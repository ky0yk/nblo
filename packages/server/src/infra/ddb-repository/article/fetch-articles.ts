import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { ResultAsync } from 'neverthrow';
import { QueryParams } from '../../../use-case/list-articles-use-case';

const ddbClient = new DynamoDBClient({ region: 'your-region' });

interface QueryCondition {
  indexName: string;
  keyConditionExpression: string;
  expressionAttributeNames: { [key: string]: string };
  expressionAttributeValues: { [key: string]: any };
}

interface BuildQueryParams extends QueryCondition {
  tableName: string;
  scanIndexForward: boolean;
}

export const fetchOwnArticles = (
  params: QueryParams,
): ResultAsync<any, Error> => {
  const userId = params.token; // この部分はダミー処理

  const queryParams = buildQueryParams(params, {
    indexName: 'AuthorIdCreatedAtIndex', //著者別インデックス): PK: authorId,  SK: Status#CreatedAt
    keyConditionExpression: '#authorId = :authorIdVal',
    expressionAttributeNames: {
      '#authorId': 'authorId',
      '#createdAt': 'createdAt',
    },
    expressionAttributeValues: { ':authorIdVal': { S: userId } },
  });

  return executeQuery(queryParams);
};

export const fetchArticlesByAuthor = (
  params: QueryParams,
): ResultAsync<any, Error> => {
  const queryParams = buildQueryParams(params, {
    indexName: 'AuthorIdCreatedAtIndex', // 著者別公開インデックス) PK: authorId,  SK: createdAt
    keyConditionExpression: '#authorId = :authorIdVal',
    expressionAttributeNames: {
      '#authorId': 'authorId',
      '#createdAt': 'createdAt',
    },
    expressionAttributeValues: { ':authorIdVal': { S: params.authorId } },
  });

  return executeQuery(queryParams);
};

export const fetchArticles = (params: QueryParams): ResultAsync<any, Error> => {
  const queryParams = buildQueryParams(params, {
    indexName: 'StatusCreatedAtIndex', // 公開インデックス): PK: status,  SK: createdAt
    keyConditionExpression: '#status = :statusVal',
    expressionAttributeNames: {
      '#status': 'status',
      '#createdAt': 'createdAt',
    },
    expressionAttributeValues: { ':statusVal': { S: 'public' } },
  });

  return executeQuery(queryParams);
};

const executeQuery = (params: BuildQueryParams): ResultAsync<any, Error> => {
  const command = new QueryCommand({
    TableName: params.tableName,
    IndexName: params.indexName,
    KeyConditionExpression: params.keyConditionExpression,
    ExpressionAttributeNames: params.expressionAttributeNames,
    ExpressionAttributeValues: params.expressionAttributeValues,
    ScanIndexForward: params.scanIndexForward,
  });

  return ResultAsync.fromPromise(
    ddbClient.send(command).then((data) => data.Items),
    (error) => new Error(`Failed to fetch articles: ${error}`),
  );
};

const buildQueryParams = (
  params: QueryParams,
  condition: QueryCondition,
): BuildQueryParams => {
  const { startDate, endDate, sort } = params;
  const scanIndexForward = sort !== 'desc'; // 降順が指定されたらfalse

  let keyConditionExpression = condition.keyConditionExpression;
  let expressionAttributeValues = { ...condition.expressionAttributeValues };

  if (startDate && endDate) {
    keyConditionExpression += ' AND #createdAt BETWEEN :startDate AND :endDate';
    expressionAttributeValues[':startDate'] = { S: startDate };
    expressionAttributeValues[':endDate'] = { S: endDate };
  }

  return {
    tableName: 'Articles',
    indexName: condition.indexName,
    keyConditionExpression,
    expressionAttributeNames: condition.expressionAttributeNames,
    expressionAttributeValues,
    scanIndexForward,
  };
};
