import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().trim().max(3000).optional().nullable(),   // optional text content
  hashtags: z.string().trim().optional().nullable(),            // optional hashtags
  isRepost: z.boolean().optional().default(false),              // optional repost flag
  originalPostId: z.number().int().positive().optional().nullable(), // optional repost id
  repostComment: z.string().trim().max(1000).optional().nullable(),  // optional repost comment
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
