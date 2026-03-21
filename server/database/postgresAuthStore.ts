import { eq } from 'drizzle-orm';
import { AuthUser, UserId } from '../../src/types';
import { DrizzleDb } from './db';
import { UserRow, userIdentities, users } from './schema';
import { AuthStore, GoogleUserIdentity } from './authStore';

function mapUserRow(row: UserRow): AuthUser {
  return {
    id:          row.id,
    email:       row.email,
    displayName: row.displayName,
    avatarUrl:   row.avatarUrl ?? undefined,
  };
}

export function createPostgresAuthStore(db: DrizzleDb): AuthStore {
  return {
    async getUserById(id: UserId): Promise<AuthUser | null> {
      const [row] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return row ? mapUserRow(row) : null;
    },

    async upsertGoogleUser(identity: GoogleUserIdentity): Promise<AuthUser> {
      return db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            email:       identity.email,
            displayName: identity.displayName,
            avatarUrl:   identity.avatarUrl ?? null,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: {
              displayName: identity.displayName,
              avatarUrl:   identity.avatarUrl ?? null,
              updatedAt:   new Date(),
            },
          })
          .returning();

        await tx
          .insert(userIdentities)
          .values({
            userId:          user.id,
            provider:        'google',
            providerSubject: identity.subject,
            email:           identity.email,
          })
          .onConflictDoUpdate({
            target: [userIdentities.provider, userIdentities.providerSubject],
            set: {
              userId:    user.id,
              email:     identity.email,
              updatedAt: new Date(),
            },
          });

        return mapUserRow(user);
      });
    },
  };
}
