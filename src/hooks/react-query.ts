import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '../utils/api';
import type { Snippet, SnippetId } from '../types';

export type SnippetQueryParams = {
  q?: string;
  language?: string;
  limit?: number;
  offset?: number;
};

type UseSnippetsOptions = {
  enabled?: boolean;
};

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (params: SnippetQueryParams) => [...snippetKeys.lists(), params] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: SnippetId) => [...snippetKeys.details(), id] as const,
};

const buildSnippetQueryString = (params: SnippetQueryParams) => {
  const qs = new URLSearchParams();

  if (params.q) qs.set('q', params.q);
  if (params.language) qs.set('language', params.language);

  qs.set('_sort', 'id');
  qs.set('_order', 'desc');

  if (params.limit !== undefined) qs.set('_limit', String(params.limit));
  if (params.offset !== undefined) qs.set('_start', String(params.offset));

  return qs.toString();
};

export const useSnippets = (params: SnippetQueryParams, options: UseSnippetsOptions = {}) => {
  const queryString = buildSnippetQueryString(params);

  return useQuery({
    queryKey: snippetKeys.list(params),
    queryFn: () => get<Snippet[]>(`snippets?${queryString}`),
    staleTime: 30 * 60_000,
    enabled: options.enabled ?? true,
  });
};

type UseSnippetOptions = {
  enabled?: boolean;
};

export type SnippetNeighbors = {
  prevId: SnippetId | null;
  nextId: SnippetId | null;
  prefetchIds: SnippetId[];
};

const snippetNavOrderKey = ['snippets', 'nav-order'] as const;

export const useSnippetNeighbors = (currentId: SnippetId | null): SnippetNeighbors => {
  const queryClient = useQueryClient();

  const { data: snippets } = useQuery({
    queryKey: snippetNavOrderKey,
    queryFn: () => get<Snippet[]>('snippets?_sort=id&_order=asc'),
    staleTime: 30 * 60_000,
    initialData: () => {
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });

      for (const [, data] of lists) {
        if (data?.length) {
          return [...data].sort((a, b) => a.id - b.id);
        }
      }

      return undefined;
    },
    initialDataUpdatedAt: () => {
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });

      for (const [key] of lists) {
        const state = queryClient.getQueryState(key);
        if (state?.dataUpdatedAt) {
          return state.dataUpdatedAt;
        }
      }

      return 0;
    },
  });

  return useMemo(() => {
    if (currentId === null || !snippets?.length) {
      return { prevId: null, nextId: null, prefetchIds: [] };
    }

    const index = snippets.findIndex((snippet) => snippet.id === currentId);

    if (index === -1) {
      return { prevId: null, nextId: null, prefetchIds: [] };
    }

    const prevId = snippets[index - 1]?.id ?? null;
    const nextId = snippets[index + 1]?.id ?? null;
    const prefetchIds: SnippetId[] = [];

    for (let offset = 1; offset <= 3; offset += 1) {
      if (snippets[index - offset]) prefetchIds.push(snippets[index - offset].id);
      if (snippets[index + offset]) prefetchIds.push(snippets[index + offset].id);
    }

    return { prevId, nextId, prefetchIds };
  }, [currentId, snippets]);
};

export const useSnippet = (id: SnippetId | null, options: UseSnippetOptions = {}) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: snippetKeys.detail(id ?? 0),
    enabled: id !== null && (options.enabled ?? true),
    staleTime: 30 * 60_000,
    initialData: () => {
      if (id === null) {
        return undefined;
      }

      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });

      for (const [, data] of lists) {
        const foundSnippet = data?.find((snippet) => snippet.id === id);
        if (foundSnippet) {
          return foundSnippet;
        }
      }

      return undefined;
    },
    initialDataUpdatedAt: () => {
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });

      for (const [key] of lists) {
        const state = queryClient.getQueryState(key);
        if (state?.dataUpdatedAt) {
          return state.dataUpdatedAt;
        }
      }

      return 0;
    },
    queryFn: async () => {
      if (id === null) {
        throw new Error('Snippet id is required');
      }

      return get<Snippet>(`snippets/${id}`);
    },
  });
};
