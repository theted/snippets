// @vitest-environment node
import cookie from '@fastify/cookie';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import type { AuthUser, CreateSnippet, Snippet, UserId } from '../../src/types';
import type { GoogleAuthService } from '../auth/google';
import { createRequireUser } from '../auth/session';
import { SnippetCache } from '../cache/snippetCache';
import type { AppConfig } from '../config';
import type { SnippetStore } from '../database/snippetStore';
import { registerSnippetRoutes } from './snippets';

const config = {
  auth: {
    google: { enabled: true, clientId: 'test-client' },
    sessionCookie: { name: 'snippets_session', secret: 'test-secret-at-least-16', secure: false },
  },
} as AppConfig;

const alice: AuthUser = { id: 1, email: 'alice@example.com', displayName: 'Alice' };
const bob: AuthUser = { id: 2, email: 'bob@example.com', displayName: 'Bob' };
const usersById = new Map([alice, bob].map((user) => [user.id, user]));

const input: CreateSnippet = { title: 'Title', content: 'code', description: '', language: 'javascript' };

const createMemoryStore = (initial: Snippet[]): SnippetStore => {
  const rows = new Map(initial.map((snippet) => [snippet.id, snippet]));
  let nextId = 100;

  return {
    listSnippets: async () => [...rows.values()],
    getSnippet: async (id) => rows.get(id) ?? null,
    createSnippet: async (data, ownerId: UserId | null) => {
      const snippet = { ...data, id: nextId++, ...(ownerId !== null && { userId: ownerId }) };
      rows.set(snippet.id, snippet);
      return snippet;
    },
    updateSnippet: async (id, data) => {
      const existing = rows.get(id);
      if (!existing) return null;
      const snippet = { ...existing, ...data };
      rows.set(id, snippet);
      return snippet;
    },
    deleteSnippet: async (id) => rows.delete(id),
    getStats: async () => ({ totalSnippets: 0, totalLanguages: 0, totalLines: 0, totalBytes: 0, topLanguages: [] }),
    close: async () => {},
  };
};

const googleAuthService = {
  findUserById: async (id: UserId) => usersById.get(id) ?? null,
} as GoogleAuthService;

const buildTestApp = async (authService?: GoogleAuthService) => {
  const store = createMemoryStore([
    { id: 1, ...input, userId: alice.id },
    { id: 2, ...input },
  ]);
  const app = Fastify();
  await app.register(cookie, { secret: config.auth.sessionCookie.secret });
  app.decorateRequest('authUser', null);
  await registerSnippetRoutes(app, store, new SnippetCache(), createRequireUser(config, authService));

  const sessionFor = (user: AuthUser) => ({
    [config.auth.sessionCookie.name]: app.signCookie(JSON.stringify({ userId: user.id })),
  });

  return { app, store, sessionFor };
};

describe('snippet write routes with auth enabled', () => {
  it('rejects anonymous create, update and delete with 401', async () => {
    const { app } = await buildTestApp(googleAuthService);

    const responses = await Promise.all([
      app.inject({ method: 'POST', url: '/snippets', payload: input }),
      app.inject({ method: 'PUT', url: '/snippets/1', payload: input }),
      app.inject({ method: 'DELETE', url: '/snippets/1' }),
    ]);

    expect(responses.map((response) => response.statusCode)).toEqual([401, 401, 401]);
  });

  it('rejects a forged session cookie', async () => {
    const { app } = await buildTestApp(googleAuthService);

    const response = await app.inject({
      method: 'DELETE',
      url: '/snippets/1',
      cookies: { [config.auth.sessionCookie.name]: JSON.stringify({ userId: alice.id }) },
    });

    expect(response.statusCode).toBe(401);
  });

  it('still allows anonymous reads', async () => {
    const { app } = await buildTestApp(googleAuthService);

    const response = await app.inject({ method: 'GET', url: '/snippets/1' });

    expect(response.statusCode).toBe(200);
  });

  it('stamps the signed-in user as owner on create', async () => {
    const { app, sessionFor } = await buildTestApp(googleAuthService);

    const response = await app.inject({ method: 'POST', url: '/snippets', payload: input, cookies: sessionFor(bob) });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ userId: bob.id });
  });

  it('lets the owner update and delete their snippet', async () => {
    const { app, store, sessionFor } = await buildTestApp(googleAuthService);

    const updated = await app.inject({
      method: 'PUT', url: '/snippets/1', payload: { ...input, title: 'New' }, cookies: sessionFor(alice),
    });
    const deleted = await app.inject({ method: 'DELETE', url: '/snippets/1', cookies: sessionFor(alice) });

    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({ title: 'New', userId: alice.id });
    expect(deleted.statusCode).toBe(204);
    expect(await store.getSnippet(1)).toBeNull();
  });

  it("forbids changing someone else's snippet", async () => {
    const { app, store, sessionFor } = await buildTestApp(googleAuthService);

    const updated = await app.inject({ method: 'PUT', url: '/snippets/1', payload: input, cookies: sessionFor(bob) });
    const deleted = await app.inject({ method: 'DELETE', url: '/snippets/1', cookies: sessionFor(bob) });

    expect(updated.statusCode).toBe(403);
    expect(deleted.statusCode).toBe(403);
    expect(await store.getSnippet(1)).not.toBeNull();
  });

  it('forbids changing snippets that have no owner', async () => {
    const { app, sessionFor } = await buildTestApp(googleAuthService);

    const response = await app.inject({ method: 'DELETE', url: '/snippets/2', cookies: sessionFor(alice) });

    expect(response.statusCode).toBe(403);
  });

  it('returns 404 for a missing snippet', async () => {
    const { app, sessionFor } = await buildTestApp(googleAuthService);

    const response = await app.inject({ method: 'DELETE', url: '/snippets/999', cookies: sessionFor(alice) });

    expect(response.statusCode).toBe(404);
  });
});

describe('snippet write routes with auth disabled', () => {
  it('keeps writes open and ownerless', async () => {
    const { app } = await buildTestApp();

    const created = await app.inject({ method: 'POST', url: '/snippets', payload: input });
    const deleted = await app.inject({ method: 'DELETE', url: '/snippets/1' });

    expect(created.statusCode).toBe(201);
    expect(created.json()).not.toHaveProperty('userId');
    expect(deleted.statusCode).toBe(204);
  });
});
