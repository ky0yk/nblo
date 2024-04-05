import { z } from 'zod';

export const articleIdSchema = z.object({
  articleId: z.string().uuid(),
});
