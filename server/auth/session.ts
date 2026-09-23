import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AppConfig } from '../config';
import { AuthUser } from '../../src/types';
import { GoogleAuthService } from './google';

const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const sessionCookieSchema = z.object({
  userId: z.number().int().positive(),
});

type SessionCookiePayload = z.infer<typeof sessionCookieSchema>;

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the `requireUser` preHandler when auth is enabled. */
    authUser: AuthUser | null;
  }
}

const cookieOptions = (config: AppConfig) => ({
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  signed: true,
  secure: config.auth.sessionCookie.secure,
});

export const setAuthSessionCookie = (
  reply: FastifyReply,
  config: AppConfig,
  payload: SessionCookiePayload,
) => {
  reply.setCookie(config.auth.sessionCookie.name, JSON.stringify(payload), {
    ...cookieOptions(config),
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });
};

export const clearAuthSessionCookie = (reply: FastifyReply, config: AppConfig) => {
  reply.clearCookie(config.auth.sessionCookie.name, cookieOptions(config));
};

export const readSessionCookie = (
  request: FastifyRequest,
  config: AppConfig,
): SessionCookiePayload | null => {
  const rawCookie = request.cookies[config.auth.sessionCookie.name];

  if (!rawCookie) {
    return null;
  }

  const unsignedCookie = request.unsignCookie(rawCookie);

  if (!unsignedCookie.valid || !unsignedCookie.value) {
    return null;
  }

  try {
    return sessionCookieSchema.parse(JSON.parse(unsignedCookie.value));
  } catch {
    return null;
  }
};

export const getSessionUser = async (
  request: FastifyRequest,
  config: AppConfig,
  googleAuthService: GoogleAuthService,
): Promise<AuthUser | null> => {
  const session = readSessionCookie(request, config);

  return session ? googleAuthService.findUserById(session.userId) : null;
};

/**
 * Builds a preHandler that rejects requests without a valid session with 401
 * and exposes the signed-in user as `request.authUser`.
 *
 * When Google auth is disabled (e.g. local json-server style setups), the
 * handler lets every request through with `authUser` left as `null`.
 */
export const createRequireUser = (config: AppConfig, googleAuthService?: GoogleAuthService) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    if (!googleAuthService) {
      return;
    }

    const user = await getSessionUser(request, config, googleAuthService);

    if (!user) {
      await reply.status(401).send({ errors: ['You must be signed in to do that.'] });
      return;
    }

    request.authUser = user;
  };
