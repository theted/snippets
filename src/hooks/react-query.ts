import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/api.ts';
import { Snippet, SnippetId } from '../types';

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (query: string) => [...snippetKeys.lists(), query] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: SnippetId) => [...snippetKeys.details(), id] as const,
};

export const useSnippets = (query: string) => useQuery({
  queryKey: snippetKeys.list(query),
  queryFn: () => get<Snippet[]>(`snippets?q=${query}&_sort=id&_order=desc`),
});

type UseSnippetOptions = {
  enabled?: boolean;
};

export const useSnippet = (id: SnippetId | null, options: UseSnippetOptions = {}) => useQuery({
  queryKey: snippetKeys.detail(id ?? 0),
  enabled: id !== null && (options.enabled ?? true),
  queryFn: async () => {
    if (id === null) {
      throw new Error('Snippet id is required');
    }

    return get<Snippet>(`snippets/${id}`);
  },
});
