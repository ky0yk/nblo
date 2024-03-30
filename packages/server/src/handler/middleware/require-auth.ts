import { NextFunction, Request, Response } from 'express';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.context?.userId) {
    return res.status(401).send('Authentication required');
  }
  next();
};
