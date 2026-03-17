import { z } from 'zod';

const Tag = z.string();

export const SnippetSchema = z.object({
  id: z.number(),
  userId: z.number().optional(),
  title: z.string(),
  content: z.string(),
  description: z.string().optional(),
  language: z.string().optional(),
  tags: z.array(Tag).optional(),
  private: z.boolean().optional(),
});

export type Snippet = z.infer<typeof SnippetSchema>;
export type SnippetId = Snippet['id'];

export const CreateSnippetSchema = SnippetSchema.omit({ id: true });
export type CreateSnippet = z.infer<typeof CreateSnippetSchema>;

export type SnippetFormValues = {
  title: string;
  content: string;
  description: string;
  language: string;
};
