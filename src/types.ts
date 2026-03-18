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

export const AuthUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type UserId = AuthUser['id'];

export const AuthSessionResponseSchema = z.object({
  authEnabled: z.boolean(),
  user: AuthUserSchema.nullable(),
});

export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;
