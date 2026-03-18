import { Pool } from 'pg';
import { AuthUser, UserId } from '../../src/types';
import { AuthStore, GoogleUserIdentity } from './authStore';

type UserRow = {
  id: number;
  email: string;
  display_name: string;
  avatar_url: string | null;
};

function mapUserRow(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
  };
}

export function createPostgresAuthStore(pool: Pool): AuthStore {
  return {
    async getUserById(id: UserId): Promise<AuthUser | null> {
      const result = await pool.query<UserRow>(`
        SELECT id, email, display_name, avatar_url
        FROM users
        WHERE id = $1
      `, [id]);

      return result.rows[0] ? mapUserRow(result.rows[0]) : null;
    },

    async upsertGoogleUser(identity: GoogleUserIdentity): Promise<AuthUser> {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const userResult = await client.query<UserRow>(`
          INSERT INTO users (email, display_name, avatar_url)
          VALUES ($1, $2, $3)
          ON CONFLICT (email)
          DO UPDATE SET
            display_name = EXCLUDED.display_name,
            avatar_url = EXCLUDED.avatar_url,
            updated_at = NOW()
          RETURNING id, email, display_name, avatar_url
        `, [identity.email, identity.displayName, identity.avatarUrl ?? null]);

        const user = userResult.rows[0];

        await client.query(`
          INSERT INTO user_identities (user_id, provider, provider_subject, email)
          VALUES ($1, 'google', $2, $3)
          ON CONFLICT (provider, provider_subject)
          DO UPDATE SET
            user_id = EXCLUDED.user_id,
            email = EXCLUDED.email,
            updated_at = NOW()
        `, [user.id, identity.subject, identity.email]);

        await client.query('COMMIT');

        return mapUserRow(user);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
