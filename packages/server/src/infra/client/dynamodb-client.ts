import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const createDynamoDBClient = (): DynamoDBClient => {
  const region = process.env.AWS_REGION || 'ap-northeast-1';
  const endpoint = 'http://localhost:8000';

  return new DynamoDBClient({
    region: region,
    ...(endpoint && { endpoint }),
  });
};

export default createDynamoDBClient;
