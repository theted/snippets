import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/api.ts';
import { Snippet } from '../types';

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (query: string) => [...snippetKeys.lists(), query] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: number) => [...snippetKeys.details(), id] as const,
};

export const useSnippets = (query: string) => useQuery({
  queryKey: snippetKeys.list(query),
  queryFn: () => get<Snippet[]>(`snippets?q=${query}&_sort=id&_order=desc`),
});

export const useSnippet = (id: number) => useQuery({
  queryKey: snippetKeys.detail(id),
  queryFn: () => get<Snippet>(`snippets/${id}`),
});
