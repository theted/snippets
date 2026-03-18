import { buildApp } from './app';

async function start() {
  const { app, config } = await buildApp();

  await app.listen({
    port: config.apiPort,
    host: '0.0.0.0',
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
