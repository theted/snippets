#!/usr/bin/env node
import 'dotenv/config';
import { spawn, spawnSync } from 'node:child_process';

const backend = process.env.SNIPPETS_API_BACKEND ?? 'json-server';
const useLocalPostgres = process.env.POSTGRES_USE_LOCAL === 'true';

const POSTGRES_COMPOSE_FILE = 'docker-compose.postgres.yml';
const POSTGRES_SERVICE = 'postgres';

const commands = {
  'json-server': ['npm', 'run', 'api:json'],
  database: ['npm', 'run', 'api:db'],
};

const selectedCommand = commands[backend];

if (!selectedCommand) {
  console.error(`Unsupported SNIPPETS_API_BACKEND "${backend}". Expected "json-server" or "database".`);
  process.exit(1);
}

// When using the database backend, spin up the postgres docker container
// unless the caller explicitly opted in to a locally-running postgres.
// --wait blocks until the healthcheck passes so the API never starts
// against an unready database.
// The container is intentionally NOT stopped on exit — data persists
// across API restarts via the named docker volume.
if (backend === 'database' && !useLocalPostgres) {
  console.log('[snippets] Starting Postgres container…');
  const result = spawnSync(
    'docker',
    ['compose', '-f', POSTGRES_COMPOSE_FILE, 'up', '-d', '--wait', POSTGRES_SERVICE],
    { stdio: 'inherit' },
  );

  if (result.status !== 0) {
    console.error('[snippets] Failed to start Postgres container. Is Docker running?');
    console.error('[snippets] To use a local Postgres instead, set POSTGRES_USE_LOCAL=true.');
    process.exit(1);
  }

  console.log('[snippets] Postgres is ready.');
}

const child = spawn(selectedCommand[0], selectedCommand.slice(1), {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
