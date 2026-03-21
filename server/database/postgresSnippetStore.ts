import { and, asc, count, countDistinct, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { CreateSnippet, Snippet, SnippetId } from '../../src/types';
import { DrizzleDb } from './db';
import { SnippetRow, snippets } from './schema';
import { ListSnippetsOptions, SnippetStats, SnippetStore } from './snippetStore';

function mapSnippetRow(row: SnippetRow): Snippet {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    description: row.description ?? '',
    language: row.language,
  };
}

export function createPostgresSnippetStore(db: DrizzleDb): SnippetStore {
  return {
    async listSnippets({ query, language, order = 'desc' }: ListSnippetsOptions): Promise<Snippet[]> {
      const conditions = [];

      if (query && query.trim().length > 0) {
        const term = `%${query.trim()}%`;
        conditions.push(
          or(
            ilike(snippets.title, term),
            ilike(snippets.content, term),
            ilike(sql`COALESCE(${snippets.description}, '')`, term),
            ilike(snippets.language, term),
          ),
        );
      }

      if (language && language.trim().length > 0) {
        conditions.push(eq(snippets.language, language.trim()));
      }

      const rows = await db
        .select({
          id:          snippets.id,
          title:       snippets.title,
          content:     snippets.content,
          description: snippets.description,
          language:    snippets.language,
          updatedAt:   snippets.updatedAt,
        })
        .from(snippets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(order === 'asc' ? asc(snippets.id) : desc(snippets.id));

      return rows.map(mapSnippetRow);
    },

    async getSnippet(id: SnippetId): Promise<Snippet | null> {
      const [row] = await db
        .select()
        .from(snippets)
        .where(eq(snippets.id, id))
        .limit(1);

      return row ? mapSnippetRow(row) : null;
    },

    async createSnippet(input: CreateSnippet): Promise<Snippet> {
      const [row] = await db
        .insert(snippets)
        .values({
          title:       input.title,
          content:     input.content,
          description: input.description ?? '',
          language:    input.language ?? 'javascript',
        })
        .returning();

      return mapSnippetRow(row);
    },

    async updateSnippet(id: SnippetId, input: CreateSnippet): Promise<Snippet | null> {
      const [row] = await db
        .update(snippets)
        .set({
          title:       input.title,
          content:     input.content,
          description: input.description ?? '',
          language:    input.language ?? 'javascript',
          updatedAt:   new Date(),
        })
        .where(eq(snippets.id, id))
        .returning();

      return row ? mapSnippetRow(row) : null;
    },

    async deleteSnippet(id: SnippetId): Promise<boolean> {
      const deleted = await db
        .delete(snippets)
        .where(eq(snippets.id, id))
        .returning({ id: snippets.id });

      return deleted.length > 0;
    },

    async getStats(): Promise<SnippetStats> {
      const [row] = await db
        .select({
          totalSnippets:   count(),
          totalLanguages:  countDistinct(snippets.language),
          totalLines:      sql<number>`COALESCE(SUM(array_length(string_to_array(${snippets.content}, E'\\n'), 1)), 0)`,
          totalCharacters: sql<number>`COALESCE(SUM(length(${snippets.content})), 0)`,
        })
        .from(snippets);

      const topLanguages = await db
        .select({
          language: snippets.language,
          count:    sql<number>`COUNT(*)::int`,
        })
        .from(snippets)
        .groupBy(snippets.language)
        .orderBy(sql`COUNT(*) DESC`);

      return {
        totalSnippets:   row.totalSnippets,
        totalLanguages:  row.totalLanguages,
        totalLines:      row.totalLines,
        totalCharacters: row.totalCharacters,
        topLanguages,
      };
    },

    async close(): Promise<void> {},
  };
}
