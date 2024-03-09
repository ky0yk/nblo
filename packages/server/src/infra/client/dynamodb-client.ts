import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const createDynamoDBClient = (): DynamoDBClient => {
  const region = process.env.AWS_REGION || 'ap-northeast-1';
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  const endpoint = isTestEnvironment ? 'http://localhost:8000' : undefined;

  return new DynamoDBClient({
    region: region,
    ...(endpoint && { endpoint }),
  });
};

export default createDynamoDBClient;
