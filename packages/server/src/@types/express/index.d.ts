type Context = {
  userId?: string;
  client: import('@/infra/shared/dynamodb-result-client').DynamoDbResultClient;
};

declare namespace Express {
  interface Request {
    context: Context;
  }
}
