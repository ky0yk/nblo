import serverlessExpress from '@codegenie/serverless-express';
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support';
import express from 'express';
import app from './app';

export const handler: APIGatewayProxyHandler = (event, context, callback) => {
  const app = express();

  const serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context, callback);
};

const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
