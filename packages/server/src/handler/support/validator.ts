import { Request } from 'express';
import { Result, err, ok } from 'neverthrow';
import { ZodSchema, z } from 'zod';

export const validateWithSchema = <T>(
  schema: ZodSchema<T>,
  data: Request['body'] | Request['params'],
): Result<T, z.ZodError> => {
  const result = schema.safeParse(data);
  return result.success ? ok(result.data) : err(result.error);
};
