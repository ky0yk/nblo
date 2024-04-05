import serverlessExpress from '@codegenie/serverless-express';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { buildApp } from './app';

let serverlessExpressInstance: ReturnType<
  typeof serverlessExpress<APIGatewayProxyEvent>
> | null = null;

export const handler: APIGatewayProxyHandler = (event, context, callback) => {
  if (serverlessExpressInstance === null) {
    const app = buildApp();
    serverlessExpressInstance = serverlessExpress({ app });
  }
  return serverlessExpressInstance(event, context, callback);
};
