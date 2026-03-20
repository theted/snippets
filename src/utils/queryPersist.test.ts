import { QueryClient } from '@tanstack/react-query';
import { createPersistentQueryClient, clearPersistedCache } from './queryPersist';

const CACHE_KEY = 'snippets-rq-v1';

beforeEach(() => {
  localStorage.clear();
});

// ── createPersistentQueryClient ────────────────────────────────────────────────

test('returns a QueryClient instance', () => {
  const client = createPersistentQueryClient();
  expect(client).toBeInstanceOf(QueryClient);
});

test('returns a client with the expected default staleTime', () => {
  const client = createPersistentQueryClient();
  expect(client.getDefaultOptions().queries?.staleTime).toBe(60_000);
});

test('hydrates from a valid cached snapshot on startup', async () => {
  // Seed a fresh client and set query data manually, then serialise it
  const seeder = createPersistentQueryClient();
  seeder.setQueryData(['snippets', 'list', ''], [{ id: 1, title: 'Cached' }]);

  // The onSuccess hook only saves on a successful *fetch*; bypass by calling
  // saveToStorage indirectly — we write the entry format directly to localStorage
  // to simulate what a previous session stored.
  const { dehydrate } = await import('@tanstack/react-query');
  const state = dehydrate(seeder, {
    shouldDehydrateQuery: (q) =>
      Array.isArray(q.queryKey) && q.queryKey[0] === 'snippets',
  });
  localStorage.setItem(CACHE_KEY, JSON.stringify({ state, savedAt: Date.now() }));

  const client = createPersistentQueryClient();
  const data = client.getQueryData(['snippets', 'list', '']);
  expect(data).toEqual([{ id: 1, title: 'Cached' }]);
});

test('ignores a cached snapshot older than 24 hours', async () => {
  const seeder = createPersistentQueryClient();
  seeder.setQueryData(['snippets', 'list', ''], [{ id: 99, title: 'Stale' }]);

  const { dehydrate } = await import('@tanstack/react-query');
  const state = dehydrate(seeder);
  const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
  localStorage.setItem(CACHE_KEY, JSON.stringify({ state, savedAt: twentyFiveHoursAgo }));

  const client = createPersistentQueryClient();
  const data = client.getQueryData(['snippets', 'list', '']);
  expect(data).toBeUndefined();
});

test('removes an expired entry from localStorage', async () => {
  const { dehydrate } = await import('@tanstack/react-query');
  const state = dehydrate(new QueryClient());
  const expired = Date.now() - 25 * 60 * 60 * 1000;
  localStorage.setItem(CACHE_KEY, JSON.stringify({ state, savedAt: expired }));

  createPersistentQueryClient();

  expect(localStorage.getItem(CACHE_KEY)).toBeNull();
});

test('does not throw when localStorage contains malformed JSON', () => {
  localStorage.setItem(CACHE_KEY, 'not-valid-json{{{');
  expect(() => createPersistentQueryClient()).not.toThrow();
});

// ── clearPersistedCache ────────────────────────────────────────────────────────

test('clearPersistedCache removes the stored entry', () => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ state: {}, savedAt: Date.now() }));
  clearPersistedCache();
  expect(localStorage.getItem(CACHE_KEY)).toBeNull();
});

test('clearPersistedCache is a no-op when there is nothing stored', () => {
  expect(() => clearPersistedCache()).not.toThrow();
});

// ── Save-on-success ────────────────────────────────────────────────────────────

test('saves snippets queries to localStorage after a successful fetch', async () => {
  const client = createPersistentQueryClient();

  await client.fetchQuery({
    queryKey: ['snippets', 'list', {}],
    queryFn: () => Promise.resolve([{ id: 1, title: 'Fresh' }]),
  });

  const raw = localStorage.getItem(CACHE_KEY);
  expect(raw).not.toBeNull();
  const { state, savedAt } = JSON.parse(raw!);
  expect(state.queries).toHaveLength(1);
  expect(state.queries[0].queryKey).toEqual(['snippets', 'list', {}]);
  expect(savedAt).toBeCloseTo(Date.now(), -3); // within ~1 second
});

test('does not save non-snippets queries to localStorage', async () => {
  const client = createPersistentQueryClient();

  await client.fetchQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => Promise.resolve({ name: 'Alice' }),
  });

  expect(localStorage.getItem(CACHE_KEY)).toBeNull();
});

test('only serialises snippets keys — other keys in the same client are excluded', async () => {
  const client = createPersistentQueryClient();

  await client.fetchQuery({
    queryKey: ['snippets', 'list', {}],
    queryFn: () => Promise.resolve([{ id: 1 }]),
  });
  await client.fetchQuery({
    queryKey: ['preferences', 'theme'],
    queryFn: () => Promise.resolve('dark'),
  });

  const { state } = JSON.parse(localStorage.getItem(CACHE_KEY)!);
  expect(state.queries).toHaveLength(1);
  expect(state.queries[0].queryKey[0]).toBe('snippets');
});
