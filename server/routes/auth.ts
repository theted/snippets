import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppConfig } from '../config';
import { GoogleAuthService } from '../auth/google';
import { clearAuthSessionCookie, getSessionUser, setAuthSessionCookie } from '../auth/session';

const googleCredentialSchema = z.object({
  credential: z.string().min(1, 'Google credential is required.'),
});

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

    const user = await getSessionUser(request, config, googleAuthService);

    if (!user && request.cookies[config.auth.sessionCookie.name]) {
      clearAuthSessionCookie(reply, config);
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
