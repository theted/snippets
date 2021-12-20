import { z } from 'zod';

const Tag = z.string();

export const SnippetSchema = z.object({
  id: z.string(),
  userId: z.number().optional(),
  title: z.string(),
  content: z.string(),
  description: z.string().optional(),
  language: z.string().optional(),
  tags: z.array(Tag).optional(),
  private: z.boolean().optional(),
});

export type Snippet = z.infer<typeof SnippetSchema>;

export const CreateSnippetSchema = SnippetSchema.omit({ id: true });
