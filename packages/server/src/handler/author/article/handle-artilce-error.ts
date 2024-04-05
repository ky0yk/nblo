import { Response } from 'express';

export const handleArticleError = (res: Response, error: Error): Response => {
  console.error(error.message);
  return res.status(500).send();
};
