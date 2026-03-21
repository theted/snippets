import { bigint, bigserial, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const snippets = pgTable('snippets', {
  id:          bigserial('id', { mode: 'number' }).primaryKey(),
  title:       varchar('title').notNull(),
  content:     text('content').notNull(),
  description: text('description'),
  language:    varchar('language').notNull(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id:          bigserial('id', { mode: 'number' }).primaryKey(),
  email:       varchar('email').notNull().unique(),
  displayName: varchar('display_name').notNull(),
  avatarUrl:   varchar('avatar_url'),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

export const userIdentities = pgTable('user_identities', {
  provider:        varchar('provider').notNull(),
  providerSubject: varchar('provider_subject').notNull(),
  userId:          bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  email:           varchar('email').notNull(),
  updatedAt:       timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('user_identities_provider_subject_idx').on(table.provider, table.providerSubject),
]);

export type SnippetRow      = typeof snippets.$inferSelect;
export type UserRow         = typeof users.$inferSelect;
export type UserIdentityRow = typeof userIdentities.$inferSelect;
