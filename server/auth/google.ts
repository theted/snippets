import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AuthStore, GoogleUserIdentity } from '../database/authStore';

export type GoogleAuthService = {
  verifyGoogleCredential(credential: string): Promise<GoogleUserIdentity>;
  findUserById(userId: number): ReturnType<AuthStore['getUserById']>;
  upsertGoogleUser(identity: GoogleUserIdentity): ReturnType<AuthStore['upsertGoogleUser']>;
};

function mapPayloadToGoogleUser(payload: TokenPayload): GoogleUserIdentity {
  if (!payload.sub || !payload.email || payload.email_verified !== true) {
    throw new Error('Google account payload is missing a verified email address.');
  }

  return {
    subject: payload.sub,
    email: payload.email,
    displayName: payload.name || payload.email,
    avatarUrl: payload.picture || undefined,
  };
}

export function createGoogleAuthService(clientId: string, authStore: AuthStore): GoogleAuthService {
  const oauthClient = new OAuth2Client(clientId);

  return {
    async verifyGoogleCredential(credential: string): Promise<GoogleUserIdentity> {
      const ticket = await oauthClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Unable to read Google account payload.');
      }

      return mapPayloadToGoogleUser(payload);
    },

    findUserById(userId: number) {
      return authStore.getUserById(userId);
    },

    upsertGoogleUser(identity: GoogleUserIdentity) {
      return authStore.upsertGoogleUser(identity);
    },
  };
}
