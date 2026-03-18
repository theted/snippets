import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AppConfig } from '../config';
import { GoogleAuthService } from '../auth/google';

const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const googleCredentialSchema = z.object({
  credential: z.string().min(1, 'Google credential is required.'),
});

const sessionCookieSchema = z.object({
  userId: z.number().int().positive(),
});

type SessionCookiePayload = z.infer<typeof sessionCookieSchema>;

function setAuthSessionCookie(
  reply: FastifyReply,
  config: AppConfig,
  payload: SessionCookiePayload,
) {
  reply.setCookie(config.auth.sessionCookie.name, JSON.stringify(payload), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    secure: config.auth.sessionCookie.secure,
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });
}

function clearAuthSessionCookie(reply: FastifyReply, config: AppConfig) {
  reply.clearCookie(config.auth.sessionCookie.name, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    secure: config.auth.sessionCookie.secure,
  });
}

function readSessionCookie(request: FastifyRequest, config: AppConfig): SessionCookiePayload | null {
  const rawCookie = request.cookies[config.auth.sessionCookie.name];

  if (!rawCookie) {
    return null;
  }

  const unsignedCookie = request.unsignCookie(rawCookie);

  if (!unsignedCookie.valid) {
    return null;
  }

  try {
    return sessionCookieSchema.parse(JSON.parse(unsignedCookie.value));
  } catch {
    return null;
  }
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  config: AppConfig,
  googleAuthService?: GoogleAuthService,
) {
  app.get('/auth/session', async (request, reply) => {
    if (!config.auth.google.enabled || !googleAuthService) {
      return {
        authEnabled: false,
        user: null,
      };
    }

    const session = readSessionCookie(request, config);

    if (!session) {
      return {
        authEnabled: true,
        user: null,
      };
    }

    const user = await googleAuthService.findUserById(session.userId);

    if (!user) {
      clearAuthSessionCookie(reply, config);
      return {
        authEnabled: true,
        user: null,
      };
    }

    return {
      authEnabled: true,
      user,
    };
  });

  app.post('/auth/google', async (request, reply) => {
    if (!config.auth.google.enabled || !googleAuthService) {
      reply.status(404);
      return {
        errors: ['Google auth is not enabled for this API.'],
      };
    }

    try {
      const body = googleCredentialSchema.parse(request.body);
      const verifiedIdentity = await googleAuthService.verifyGoogleCredential(body.credential);
      const user = await googleAuthService.upsertGoogleUser(verifiedIdentity);

      setAuthSessionCookie(reply, config, { userId: user.id });

      return {
        authEnabled: true,
        user,
      };
    } catch {
      reply.status(401);
      return {
        errors: ['Google sign-in could not be verified.'],
      };
    }
  });

  app.post('/auth/logout', async (_request, reply) => {
    if (!config.auth.google.enabled) {
      return {
        authEnabled: false,
        user: null,
      };
    }

    clearAuthSessionCookie(reply, config);

    return {
      authEnabled: true,
      user: null,
    };
  });
}
