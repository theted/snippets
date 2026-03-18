import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateSnippet } from '../../src/types';
import { SnippetStore } from '../database/snippetStore';

const DEFAULT_LANGUAGE = 'javascript';

const listQuerySchema = z.object({
  q: z.string().optional(),
  _sort: z.literal('id').optional(),
  _order: z.enum(['asc', 'desc']).optional(),
});

const snippetParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const snippetInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  description: z.string().optional().default(''),
  language: z.string().trim().min(1).default(DEFAULT_LANGUAGE),
});

function normalizeSnippetInput(input: z.infer<typeof snippetInputSchema>): CreateSnippet {
  return {
    title: input.title,
    content: input.content,
    description: input.description,
    language: input.language,
  };
}

export async function registerSnippetRoutes(app: FastifyInstance, store: SnippetStore) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/snippets', async (request) => {
    const query = listQuerySchema.parse(request.query);

    return store.listSnippets({
      query: query.q,
      sortBy: query._sort,
      order: query._order,
    });
  });

  app.get('/snippets/:id', async (request, reply) => {
    const { id } = snippetParamsSchema.parse(request.params);
    const snippet = await store.getSnippet(id);

    if (!snippet) {
      reply.status(404);
      return { errors: [`Snippet ${id} was not found.`] };
    }

    return snippet;
  });

  app.post('/snippets', async (request, reply) => {
    const payload = normalizeSnippetInput(snippetInputSchema.parse(request.body));
    const snippet = await store.createSnippet(payload);
    reply.status(201);
    return snippet;
  });

  app.put('/snippets/:id', async (request, reply) => {
    const { id } = snippetParamsSchema.parse(request.params);
    const payload = normalizeSnippetInput(snippetInputSchema.parse(request.body));
    const snippet = await store.updateSnippet(id, payload);

    if (!snippet) {
      reply.status(404);
      return { errors: [`Snippet ${id} was not found.`] };
    }

    return snippet;
  });

  app.delete('/snippets/:id', async (request, reply) => {
    const { id } = snippetParamsSchema.parse(request.params);
    const deleted = await store.deleteSnippet(id);

    if (!deleted) {
      reply.status(404);
      return { errors: [`Snippet ${id} was not found.`] };
    }

    reply.status(204);
    return null;
  });
}
