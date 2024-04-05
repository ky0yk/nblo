import { DynamoDbResultClient } from '@/infra/shared/dynamodb-result-client';
import { Request, Response, NextFunction } from 'express';

export const initContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.context = {
    client: new DynamoDbResultClient(),
  };
  next();
};
