import { z } from 'zod';

export const createArticleSchema = z.object({
  authorId: z.string(),
  title: z.string(),
  body: z.string(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const articleIdSchema = z.string().ulid();
