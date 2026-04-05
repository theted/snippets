import type { RefObject } from 'react';
import { useMutation, type QueryClient } from '@tanstack/react-query';
import { remove, update } from '../../utils/api';
import { invalidateSnippetQueries } from '../../utils/snippetQueryCache';
import type { Snippet as SnippetRecord, SnippetFormValues, SnippetId } from '../../types';
import { animateElement, setHomeRestoreFlag } from './snippetPageUtils';

type NavigateFn = (path: string) => void;

type Params = {
  snippetId: SnippetId | null;
  snippet: SnippetRecord | undefined;
  queryClient: QueryClient;
  navigate: NavigateFn;
  setIsEditing: (value: boolean) => void;
  contentRef: RefObject<HTMLDivElement | null>;
};

const getRequiredSnippetId = (snippetId: SnippetId | null) => {
  if (snippetId === null) {
    throw new Error('Snippet id is required');
  }

  return snippetId;
};

const getRequiredSnippet = (snippet: SnippetRecord | undefined) => {
  if (!snippet) {
    throw new Error('Snippet data is required');
  }

  return snippet;
};

const useSnippetPageMutations = ({
  snippetId,
  snippet,
  queryClient,
  navigate,
  setIsEditing,
  contentRef,
}: Params) => {
  const updateMutation = useMutation({
    mutationFn: (formValues: SnippetFormValues) =>
      update(`snippets/${getRequiredSnippetId(snippetId)}`, {
        ...getRequiredSnippet(snippet),
        ...formValues,
      }),
    onMutate: () => {
      setIsEditing(false);
    },
    onError: () => {
      setIsEditing(true);
    },
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const currentSnippetId = getRequiredSnippetId(snippetId);

      await animateElement(contentRef.current, {
        opacity: 0,
        y: -20,
        filter: 'blur(8px)',
        duration: 0.45,
        ease: 'power3.in',
      });

      await remove('snippets', currentSnippetId);
    },
    onError: async () => {
      await animateElement(contentRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.18,
        ease: 'power2.out',
      });
    },
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
      setHomeRestoreFlag();
      navigate('/');
    },
  });

  return {
    updateSnippet: updateMutation.mutate,
    updateError: updateMutation.error,
    resetUpdate: updateMutation.reset,
    deleteSnippet: deleteMutation.mutate,
    deleteError: deleteMutation.error,
    resetDelete: deleteMutation.reset,
  };
};

export default useSnippetPageMutations;
