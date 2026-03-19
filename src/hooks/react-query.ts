import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '../utils/api.ts';
import { Snippet, SnippetId } from '../types';

export type SnippetQueryParams = {
  q?: string;
  language?: string;
  limit?: number;
  offset?: number;
};

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (params: SnippetQueryParams) => [...snippetKeys.lists(), params] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: SnippetId) => [...snippetKeys.details(), id] as const,
};

export const useSnippets = (params: SnippetQueryParams) => {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.language) qs.set('language', params.language);
  qs.set('_sort', 'id');
  qs.set('_order', 'desc');
  if (params.limit !== undefined) qs.set('_limit', String(params.limit));
  if (params.offset !== undefined) qs.set('_start', String(params.offset));

  return useQuery({
    queryKey: snippetKeys.list(params),
    queryFn: () => get<Snippet[]>(`snippets?${qs.toString()}`),
    staleTime: 30_000,
  });
};

type UseSnippetOptions = {
  enabled?: boolean;
};

export type SnippetNeighbors = {
  prevId: SnippetId | null;
  nextId: SnippetId | null;
  /** IDs of up to 3 snippets on each side — used for prefetching. */
  prefetchIds: SnippetId[];
};

// Dedicated key for the navigation order — separate from the search list so
// it's never affected by search state or stale search cache entries.
const snippetNavOrderKey = ['snippets', 'nav-order'] as const;

/**
 * Returns the IDs of the snippets immediately before and after `currentId`,
 * sorted by id ASC (prevId = lower id, nextId = higher id).
 *
 * ── Current strategy: full ordered list ────────────────────────────────────
 * Fetches all snippet IDs in a single request sorted by id ASC.  Uses its own
 * query key so it is independent of the search list.  On the common path
 * (navigating from the archive page) the data is already cached; on direct
 * URL navigation it fetches once and stays cached for staleTime.
 *
 * ── Future strategy: swap here when paginated ──────────────────────────────
 * Replace the queryFn below with a dedicated endpoint, e.g.:
 *   GET /snippets/:id/neighbors  →  { prevId: number|null, nextId: number|null }
 * The hook's return type and all call sites in SnippetPage stay unchanged.
 */
export const useSnippetNeighbors = (currentId: SnippetId | null): SnippetNeighbors => {
  const queryClient = useQueryClient();

  const { data: snippets } = useQuery({
    queryKey: snippetNavOrderKey,
    queryFn: () => get<Snippet[]>('snippets?_sort=id&_order=asc'),
    staleTime: 60_000,
    // Seed from any cached list so navigation buttons are enabled immediately
    // when arriving from the archive page — no extra round-trip needed.
    initialData: () => {
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });
      for (const [, data] of lists) {
        if (data?.length) return [...data].sort((a, b) => a.id - b.id);
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });
      for (const [key] of lists) {
        const state = queryClient.getQueryState(key);
        if (state?.dataUpdatedAt) return state.dataUpdatedAt;
      }
      return 0;
    },
  });

  return useMemo(() => {
    if (currentId === null || !snippets?.length) return { prevId: null, nextId: null, prefetchIds: [] };
    const index = snippets.findIndex((s) => s.id === currentId);
    if (index === -1) return { prevId: null, nextId: null, prefetchIds: [] };

    const prevId = snippets[index - 1]?.id ?? null;
    const nextId = snippets[index + 1]?.id ?? null;

    const prefetchIds: SnippetId[] = [];
    for (let i = 1; i <= 3; i++) {
      if (snippets[index - i]) prefetchIds.push(snippets[index - i].id);
      if (snippets[index + i]) prefetchIds.push(snippets[index + i].id);
    }

    return { prevId, nextId, prefetchIds };
  }, [currentId, snippets]);
};

export const useSnippet = (id: SnippetId | null, options: UseSnippetOptions = {}) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: snippetKeys.detail(id ?? 0),
    enabled: id !== null && (options.enabled ?? true),
    staleTime: 30_000,
    // Seed from any cached list so the detail page renders instantly on first visit
    initialData: () => {
      if (id === null) return undefined;
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });
      for (const [, data] of lists) {
        const found = data?.find((s) => s.id === id);
        if (found) return found;
      }
      return undefined;
    },
    // Inherit the list query's timestamp so React Query treats the seeded data
    // as fresh rather than immediately triggering a background refetch.
    initialDataUpdatedAt: () => {
      const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });
      for (const [key] of lists) {
        const state = queryClient.getQueryState(key);
        if (state?.dataUpdatedAt) return state.dataUpdatedAt;
      }
      return 0;
    },
    queryFn: async () => {
      if (id === null) throw new Error('Snippet id is required');
      return get<Snippet>(`snippets/${id}`);
    },
  });
};
