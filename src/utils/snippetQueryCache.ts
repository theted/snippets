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

export function removeSnippetFromLists(queryClient: QueryClient, snippetId: SnippetId): void {
  queryClient.setQueriesData<Snippet[]>({ queryKey: snippetKeys.lists() }, (snippets = []) => snippets
    .filter((snippet) => snippet.id !== snippetId));
}

export function invalidateSnippetQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: snippetKeys.all });
}
