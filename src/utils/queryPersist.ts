/**
 * localStorage persistence for the React Query snippet cache.
 *
 * How it works:
 *  1. On every successful snippet query, the whole 'snippets' slice of the
 *     cache is dehydrated (serialised) and saved to localStorage.
 *  2. On startup, any saved snapshot that is younger than MAX_AGE is
 *     rehydrated into the QueryClient before the first render — so lists
 *     and detail pages paint immediately without a loading flash.
 *  3. Mutations call invalidateSnippetQueries, which triggers refetches;
 *     those refetches go through onSuccess and overwrite the snapshot, so
 *     the cache stays up to date automatically.
 */

import {
  QueryClient,
  QueryCache,
  dehydrate,
  hydrate,
  type DehydratedState,
} from '@tanstack/react-query';

const CACHE_KEY  = 'snippets-rq-v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 h — discard anything older

type StoredEntry = { state: DehydratedState; savedAt: number };

function saveToStorage(client: QueryClient): void {
  try {
    const state = dehydrate(client, {
      shouldDehydrateQuery: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === 'snippets',
    });
    const entry: StoredEntry = { state, savedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function loadFromStorage(): DehydratedState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { state, savedAt }: StoredEntry = JSON.parse(raw);
    if (Date.now() - savedAt > MAX_AGE_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

/**
 * Creates a QueryClient whose snippet queries are persisted to localStorage.
 * Drop-in replacement for `new QueryClient({ defaultOptions })`.
 */
export function createPersistentQueryClient(): QueryClient {
  // Use a ref object so the onSuccess closure can safely reference the
  // client instance without a "used before assigned" TypeScript error.
  const ref: { client: QueryClient | null } = { client: null };

  const queryCache = new QueryCache({
    onSuccess(_data, query) {
      if (!ref.client) return;
      if (!Array.isArray(query.queryKey) || query.queryKey[0] !== 'snippets') return;
      saveToStorage(ref.client);
    },
  });

  ref.client = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        staleTime: 30 * 60_000,  // data stays fresh for 30 min
        gcTime:    2 * 60 * 60_000, // keep inactive queries in memory for 2 h
        retry: 1,
      },
    },
  });

  // Hydrate immediately — data is available before the first render
  const cached = loadFromStorage();
  if (cached) hydrate(ref.client, cached);

  return ref.client;
}

/** Wipe the persisted snapshot (e.g. on sign-out). */
export function clearPersistedCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
