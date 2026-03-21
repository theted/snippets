import { Pool } from 'pg';
import { CreateSnippet, Snippet, SnippetId } from '../../src/types';
import { ListSnippetsOptions, SnippetStats, SnippetStore } from './snippetStore';

type SnippetRow = {
  id: number;
  title: string;
  content: string;
  description: string | null;
  language: string;
};

function mapSnippetRow(row: SnippetRow): Snippet {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    description: row.description ?? '',
    language: row.language,
  };
}

function buildListQuery({ query, language, order = 'desc' }: ListSnippetsOptions) {
  const values: string[] = [];
  const whereClauses: string[] = [];

  if (query && query.trim().length > 0) {
    values.push(`%${query.trim()}%`);
    const n = values.length;
    whereClauses.push(`(
      title ILIKE $${n}
      OR content ILIKE $${n}
      OR COALESCE(description, '') ILIKE $${n}
      OR language ILIKE $${n}
    )`);
  }

  if (language && language.trim().length > 0) {
    values.push(language.trim());
    whereClauses.push(`language = $${values.length}`);
  }

  const direction = order === 'asc' ? 'ASC' : 'DESC';
  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  return {
    text: `
      SELECT id, title, content, description, language
      FROM snippets
      ${where}
      ORDER BY id ${direction}
    `,
    values,
  };
}

export function createPostgresSnippetStore(pool: Pool): SnippetStore {
  return {
    async listSnippets(options: ListSnippetsOptions): Promise<Snippet[]> {
      const query = buildListQuery(options);
      const result = await pool.query<SnippetRow>(query.text, query.values);
      return result.rows.map(mapSnippetRow);
    },

    async getSnippet(id: SnippetId): Promise<Snippet | null> {
      const result = await pool.query<SnippetRow>(`
        SELECT id, title, content, description, language
        FROM snippets
        WHERE id = $1
      `, [id]);

      return result.rows[0] ? mapSnippetRow(result.rows[0]) : null;
    },

    async createSnippet(input: CreateSnippet): Promise<Snippet> {
      const result = await pool.query<SnippetRow>(`
        INSERT INTO snippets (title, content, description, language)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, content, description, language
      `, [input.title, input.content, input.description ?? '', input.language ?? 'javascript']);

      return mapSnippetRow(result.rows[0]);
    },

    async updateSnippet(id: SnippetId, input: CreateSnippet): Promise<Snippet | null> {
      const result = await pool.query<SnippetRow>(`
        UPDATE snippets
        SET title = $1,
            content = $2,
            description = $3,
            language = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, title, content, description, language
      `, [input.title, input.content, input.description ?? '', input.language ?? 'javascript', id]);

      return result.rows[0] ? mapSnippetRow(result.rows[0]) : null;
    },

    async deleteSnippet(id: SnippetId): Promise<boolean> {
      const result = await pool.query('DELETE FROM snippets WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    },

    async getStats(): Promise<SnippetStats> {
      const result = await pool.query<{ total_snippets: string; total_languages: string }>(`
        SELECT COUNT(*) AS total_snippets,
               COUNT(DISTINCT language) AS total_languages
        FROM snippets
      `);
      return {
        totalSnippets: Number(result.rows[0].total_snippets),
        totalLanguages: Number(result.rows[0].total_languages),
      };
    },

    async close(): Promise<void> {},
  };
}
