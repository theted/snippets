import { Pool, types } from 'pg';
import { AppConfig } from '../config';

// pg returns BIGINT/BIGSERIAL (OID 20) as strings by default because they can
// exceed Number.MAX_SAFE_INTEGER. Our IDs are small, so parse them as numbers
// so the frontend never sees string IDs.
types.setTypeParser(20, (val) => parseInt(val, 10));

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
