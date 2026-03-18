import { AuthUser, UserId } from '../../src/types';

export type GoogleUserIdentity = {
  subject: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
};

export interface AuthStore {
  getUserById(id: UserId): Promise<AuthUser | null>;
  upsertGoogleUser(identity: GoogleUserIdentity): Promise<AuthUser>;
}
