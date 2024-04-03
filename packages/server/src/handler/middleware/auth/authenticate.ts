import { Request, Response, NextFunction } from 'express';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.context.userId = '1'; // 動作確認用
  next();
};
