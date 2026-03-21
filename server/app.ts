import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import Fastify from 'fastify';
import { ZodError } from 'zod';
import { createGoogleAuthService } from './auth/google';
import { SnippetCache } from './cache/snippetCache';
import { createPostgresAuthStore } from './database/postgresAuthStore';
import { createPostgresPool } from './database/postgresPool';
import { createDrizzleDb } from './database/db';
import { getConfig } from './config';
import { createPostgresSnippetStore } from './database/postgresSnippetStore';
import { registerAuthRoutes } from './routes/auth';
import { registerSnippetRoutes } from './routes/snippets';
import { registerStatusRoute } from './routes/status';

export async function buildApp() {
  const config = getConfig();
  const postgresPool = createPostgresPool(config.database);
  const db = createDrizzleDb(postgresPool);
  const store = createPostgresSnippetStore(db);
  const cache = new SnippetCache();
  const authStore = createPostgresAuthStore(db);
  const googleAuthService = config.auth.google.enabled && config.auth.google.clientId
    ? createGoogleAuthService(config.auth.google.clientId, authStore)
    : undefined;
  const app = Fastify({
    logger: true,
  });

  await app.register(cookie, {
    secret: config.auth.sessionCookie.secret,
  });

  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.status(400).send({
        errors: [error.issues[0]?.message ?? 'Invalid request.'],
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      errors: ['Internal server error.'],
    });
  });

  await registerAuthRoutes(app, config, googleAuthService);
  await registerSnippetRoutes(app, store, cache);
  await registerStatusRoute(app, store, cache);

  app.addHook('onClose', async () => {
    await postgresPool.end();
  });

  return {
    app,
    config,
  };
}
