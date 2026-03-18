import { QueryClient, QueryKey } from '@tanstack/react-query';
import { snippetKeys } from '../hooks/react-query';
import { Snippet, SnippetId } from '../types';

export type SnippetListSnapshot = Array<[QueryKey, Snippet[] | undefined]>;

export async function snapshotSnippetLists(queryClient: QueryClient): Promise<SnippetListSnapshot> {
  await queryClient.cancelQueries({ queryKey: snippetKeys.lists() });
  return queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });
}

export function restoreSnippetLists(
  queryClient: QueryClient,
  previousSnippets?: SnippetListSnapshot,
): void {
  previousSnippets?.forEach(([queryKey, snippets]) => {
    queryClient.setQueryData(queryKey, snippets);
  });
}

export type SnippetDetailSnapshot = [QueryKey, Snippet | undefined];

export async function snapshotAndPatchSnippet(
  queryClient: QueryClient,
  updated: Snippet,
): Promise<{ lists: SnippetListSnapshot; detail: SnippetDetailSnapshot }> {
  await queryClient.cancelQueries({ queryKey: snippetKeys.lists() });
  await queryClient.cancelQueries({ queryKey: snippetKeys.detail(updated.id) });

  const lists = queryClient.getQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() });
  const detailKey = snippetKeys.detail(updated.id);
  const detail: SnippetDetailSnapshot = [detailKey, queryClient.getQueryData<Snippet>(detailKey)];

  // Patch list caches
  queryClient.setQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() }, (snippets = []) =>
    snippets.map((s) => (s.id === updated.id ? updated : s)));

  // Patch detail cache
  queryClient.setQueryData(detailKey, updated);

  return { lists, detail };
}

export function restoreSnippetDetail(queryClient: QueryClient, snapshot: SnippetDetailSnapshot): void {
  queryClient.setQueryData(snapshot[0], snapshot[1]);
}

export function removeSnippetFromLists(queryClient: QueryClient, snippetId: SnippetId): void {
  queryClient.setQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() }, (snippets = []) => snippets
    .filter((snippet) => snippet.id !== snippetId));
}

export function invalidateSnippetQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: snippetKeys.all });
}
