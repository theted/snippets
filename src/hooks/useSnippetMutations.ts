import { useMutation, useQueryClient } from '@tanstack/react-query';
import { remove, update } from '../utils/api';
import { invalidateSnippetQueries, removeSnippetFromLists, restoreSnippetDetail, restoreSnippetLists, snapshotAndPatchSnippet, snapshotSnippetLists, SnippetDetailSnapshot, SnippetListSnapshot } from '../utils/snippetQueryCache';
import { Snippet as ISnippet, SnippetId } from '../types';

type DeleteOptions = {
    /** Called after the optimistic rollback, before the error propagates. */
    onError?: () => void;
};

type UpdateOptions = {
    /** Called immediately after the optimistic patch is applied (e.g. close the edit modal). */
    onMutate?: () => void;
    /** Called after cache invalidation completes successfully. */
    onSuccess?: () => void;
    /** Called after the optimistic rollback. */
    onError?: () => void;
};

/**
 * Deletes a snippet with an optimistic list update.
 * Snapshots all list caches before mutating, rolls back on error.
 */
export function useDeleteSnippetMutation(options?: DeleteOptions) {
    const queryClient = useQueryClient();
    return useMutation<void, Error, SnippetId, { previousSnippets: SnippetListSnapshot }>({
        mutationFn: (id) => remove('snippets', id),
        onMutate: async (id) => {
            const previousSnippets = await snapshotSnippetLists(queryClient);
            removeSnippetFromLists(queryClient, id);
            return { previousSnippets };
        },
        onError: (_error, _id, context) => {
            restoreSnippetLists(queryClient, context?.previousSnippets);
            options?.onError?.();
        },
        onSuccess: async () => {
            await invalidateSnippetQueries(queryClient);
        },
    });
}

/**
 * Updates a snippet with an optimistic patch on both list and detail caches.
 * Rolls back both caches on error.
 */
export function useUpdateSnippetMutation(options?: UpdateOptions) {
    const queryClient = useQueryClient();
    return useMutation<ISnippet, Error, ISnippet, { lists: SnippetListSnapshot; detail: SnippetDetailSnapshot }>({
        mutationFn: (data) => update<ISnippet, ISnippet>(`snippets/${data.id}`, data),
        onMutate: async (updated) => {
            const snapshot = await snapshotAndPatchSnippet(queryClient, updated);
            options?.onMutate?.();
            return snapshot;
        },
        onError: (_error, _updated, context) => {
            restoreSnippetLists(queryClient, context?.lists);
            if (context?.detail) restoreSnippetDetail(queryClient, context.detail);
            options?.onError?.();
        },
        onSuccess: async () => {
            await invalidateSnippetQueries(queryClient);
            options?.onSuccess?.();
        },
    });
}
