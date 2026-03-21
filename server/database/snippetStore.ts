import { CreateSnippet, Snippet, SnippetId } from '../../src/types';

export type ListSnippetsOptions = {
  query?: string;
  language?: string;
  sortBy?: 'id';
  order?: 'asc' | 'desc';
};

export type SnippetStats = {
  totalSnippets: number;
  totalLanguages: number;
};

export interface SnippetStore {
  listSnippets(options: ListSnippetsOptions): Promise<Snippet[]>;
  getSnippet(id: SnippetId): Promise<Snippet | null>;
  createSnippet(input: CreateSnippet): Promise<Snippet>;
  updateSnippet(id: SnippetId, input: CreateSnippet): Promise<Snippet | null>;
  deleteSnippet(id: SnippetId): Promise<boolean>;
  getStats(): Promise<SnippetStats>;
  close(): Promise<void>;
}
