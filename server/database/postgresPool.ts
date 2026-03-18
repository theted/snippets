import { Pool } from 'pg';
import { AppConfig } from '../config';

export function createPostgresPool(config: AppConfig['database']) {
  return new Pool(config.connectionString ? {
    connectionString: config.connectionString,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  } : {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });
}
