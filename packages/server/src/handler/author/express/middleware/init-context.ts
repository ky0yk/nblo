import { DynamoDbResultClient } from '@/infra/client/dynamodb-result-client';
import { Request, Response, NextFunction } from 'express';

export const initContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.context = {
    userId: '',
    client: new DynamoDbResultClient(),
  };
  next();
};
