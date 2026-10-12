import { FastifyInstance, FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { z } from 'zod';
import { CreateSnippet, Snippet } from '../../src/types';
import { SnippetCache } from '../cache/snippetCache';
import { SnippetStore } from '../database/snippetStore';

const DEFAULT_LANGUAGE = 'javascript';

const listQuerySchema = z.object({
  q: z.string().optional(),
  language: z.string().optional(),
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

export async function registerSnippetRoutes(
  app: FastifyInstance,
  store: SnippetStore,
  cache: SnippetCache,
  requireUser: preHandlerHookHandler,
) {
  /**
   * Loads a snippet the current user may modify, or sends 404/403.
   * `authUser` is only null when auth is disabled, in which case anyone may
   * modify any snippet.
   */
  const findOwnedSnippet = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<Snippet | null> => {
    const { id } = snippetParamsSchema.parse(request.params);
    const snippet = await store.getSnippet(id);

    if (!snippet) {
      await reply.status(404).send({ errors: [`Snippet ${id} was not found.`] });
      return null;
    }

    if (request.authUser && snippet.userId !== request.authUser.id) {
      await reply.status(403).send({ errors: ['You can only change your own snippets.'] });
      return null;
    }

    return snippet;
  };

  app.get('/health', async () => ({ ok: true }));

  app.get('/snippets', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const isUnfiltered = !query.q && !query.language;

    if (isUnfiltered) {
      const cached = cache.get();
      if (cached) return cached;
    }

    const snippets = await store.listSnippets({
      query: query.q,
      language: query.language,
      sortBy: query._sort,
      order: query._order,
    });

    if (isUnfiltered) {
      cache.set(snippets);
    }

    return snippets;
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

  app.post('/snippets', { preHandler: requireUser }, async (request, reply) => {
    const payload = normalizeSnippetInput(snippetInputSchema.parse(request.body));
    const snippet = await store.createSnippet(payload, request.authUser?.id ?? null);
    cache.invalidate();
    reply.status(201);
    return snippet;
  });

  app.put('/snippets/:id', { preHandler: requireUser }, async (request, reply) => {
    const payload = normalizeSnippetInput(snippetInputSchema.parse(request.body));
    const existing = await findOwnedSnippet(request, reply);
    if (!existing) return reply;

    const { id } = existing;
    const snippet = await store.updateSnippet(id, payload);

    if (!snippet) {
      reply.status(404);
      return { errors: [`Snippet ${id} was not found.`] };
    }

    cache.invalidate();
    return snippet;
  });

  app.delete('/snippets/:id', { preHandler: requireUser }, async (request, reply) => {
    const existing = await findOwnedSnippet(request, reply);
    if (!existing) return reply;

    const { id } = existing;
    const deleted = await store.deleteSnippet(id);

    if (!deleted) {
      reply.status(404);
      return { errors: [`Snippet ${id} was not found.`] };
    }

    cache.invalidate();
    reply.status(204);
    return null;
  });
}
