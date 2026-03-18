import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3200),
  SNIPPETS_DATABASE_PROVIDER: z.enum(['postgres']).default('postgres'),
  DATABASE_URL: z.string().trim().min(1).optional(),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default('snippets'),
  POSTGRES_USER: z.string().default('snippets'),
  POSTGRES_PASSWORD: z.string().default('snippets'),
  POSTGRES_SSL: z.enum(['true', 'false']).default('false'),
  CORS_ORIGIN: z.string().optional(),
  GOOGLE_AUTH_ENABLED: z.enum(['true', 'false']).default('false'),
  GOOGLE_CLIENT_ID: z.string().trim().optional(),
  SESSION_COOKIE_NAME: z.string().trim().min(1).default('snippets_session'),
  SESSION_COOKIE_SECRET: z.string().trim().min(16).default('local-dev-session-secret'),
});

type ParsedEnv = z.infer<typeof envSchema>;

export type AppConfig = {
  apiPort: number;
  corsOrigin: string | boolean;
  nodeEnv: ParsedEnv['NODE_ENV'];
  database: {
    provider: ParsedEnv['SNIPPETS_DATABASE_PROVIDER'];
    connectionString?: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  auth: {
    google: {
      enabled: boolean;
      clientId?: string;
    };
    sessionCookie: {
      name: string;
      secret: string;
      secure: boolean;
    };
  };
};

export function getConfig(): AppConfig {
  const env = envSchema.parse(process.env);

  if (env.GOOGLE_AUTH_ENABLED === 'true' && !env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is required when GOOGLE_AUTH_ENABLED=true.');
  }

  return {
    apiPort: env.API_PORT,
    corsOrigin: env.CORS_ORIGIN ?? true,
    nodeEnv: env.NODE_ENV,
    database: {
      provider: env.SNIPPETS_DATABASE_PROVIDER,
      connectionString: env.DATABASE_URL,
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      database: env.POSTGRES_DB,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      ssl: env.POSTGRES_SSL === 'true',
    },
    auth: {
      google: {
        enabled: env.GOOGLE_AUTH_ENABLED === 'true',
        clientId: env.GOOGLE_CLIENT_ID,
      },
      sessionCookie: {
        name: env.SESSION_COOKIE_NAME,
        secret: env.SESSION_COOKIE_SECRET,
        secure: env.NODE_ENV === 'production',
      },
    },
  };
}
