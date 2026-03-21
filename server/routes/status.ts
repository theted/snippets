import { FastifyInstance } from 'fastify';
import { SnippetCache } from '../cache/snippetCache';
import { SnippetStore } from '../database/snippetStore';

export async function registerStatusRoute(
  app: FastifyInstance,
  store: SnippetStore,
  cache: SnippetCache,
) {
  const startedAt = new Date(Date.now() - process.uptime() * 1000);

  app.get('/status', async () => {
    const stats = await store.getStats();

    return {
      db: {
        totalSnippets:   stats.totalSnippets,
        totalLanguages:  stats.totalLanguages,
        totalLines:      stats.totalLines,
        totalCharacters: stats.totalCharacters,
        topLanguages:    stats.topLanguages,
      },
      cache: {
        snippetCount: cache.count,
        cachedAt:     cache.cachedAt,
      },
      server: {
        version: process.env.npm_package_version ?? '0.1.0',
        deployedAt: process.env.DEPLOY_TIME ?? startedAt.toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
    };
  });
}
