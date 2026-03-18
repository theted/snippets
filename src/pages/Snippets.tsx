/* eslint-disable max-len */
import React, { useContext, useState, RefObject } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import Snippet from '../components/Snippet';
import { Snippet as ISnippet, SnippetFormValues, SnippetId } from '../types';
import { update, remove } from '../utils/api.ts';
import Searchbar, { SearchbarHandle } from '../components/Searchbar';
import { SpinFigure } from '../components/Spinner';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet } from '../hooks/react-query';
import { useDebounce } from '../utils/utils';
import useReactQuery from '../hooks/useReactQuery';
import {
  invalidateSnippetQueries,
  removeSnippetFromLists,
  restoreSnippetLists,
  SnippetListSnapshot,
  snapshotSnippetLists,
} from '../utils/snippetQueryCache';

const classes = {
  container: 'w-full',
  stream: 'mt-12 flex flex-col gap-14 md:mt-16 md:gap-20',
  empty: 'rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-14 text-center backdrop-blur-2xl md:px-14 md:py-20',
  emptyTitle: 'font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-5xl',
  emptyText: 'mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] md:text-base',
  error: 'rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 text-[var(--color-text)] backdrop-blur-2xl',
};

async function removeSnippetCallback(id: SnippetId) {
  return remove('snippets', id);
}

async function updateSnippetCallback(data: ISnippet) {
  return update<ISnippet, ISnippet>(`snippets/${data.id}`, data);
}

type Props = { searchbarRef?: RefObject<SearchbarHandle | null> };

const Snippets: React.FC<Props> = ({ searchbarRef }) => {
  const queryClient = useQueryClient();
  const { theme } = useContext(ThemeContext);
  const [editingId, setEditingId] = useState<SnippetId | null>(null);
  const [search, setSearch] = useState<string>('');
  const {
    data: editingSnippetData,
    error: editingSnippetError,
  } = useSnippet(editingId);
  const { mutate: removeSnippet } = useMutation<void, Error, SnippetId, { previousSnippets: SnippetListSnapshot }>({
    mutationFn: removeSnippetCallback,
    onMutate: async (id) => {
      const previousSnippets = await snapshotSnippetLists(queryClient);
      removeSnippetFromLists(queryClient, id);

      return { previousSnippets };
    },
    onError: (_error, _id, context) => {
      restoreSnippetLists(queryClient, context?.previousSnippets);
    },
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
    },
  });
  const {
    mutate: updateSnippetMutation,
    error: updateError,
    reset: resetUpdate,
  } = useMutation({
    mutationFn: updateSnippetCallback,
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
      setEditingId(null);
    },
  });
  const debouncedSearchQuery = useDebounce(search, 600);
  const { data: snippets = [], isPending, error } = useReactQuery(debouncedSearchQuery);

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <SpinFigure />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className={classes.error}>
        An error has occurred:
        {' '}
        {error.message}
      </div>
    );
  }

  if (error) {
    return <div className={classes.error}>An unknown error has occurred.</div>;
  }

  const onDelete = (id: SnippetId) => removeSnippet(id);

  const onEdit = (id: SnippetId) => setEditingId(id);

  const onSearch = (value: string) => setSearch(value);

  const closeModal = () => {
    setEditingId(null);
    resetUpdate();
  };

  const updateSnippet = (formValues: SnippetFormValues) => {
    if (!editingSnippetData) {
      return;
    }

    updateSnippetMutation({
      ...editingSnippetData,
      ...formValues,
    });
  };

  return (
    <section className={classes.container}>
      <Searchbar ref={searchbarRef} onSearch={onSearch} />

      <div className={classes.stream}>
        {snippets.length === 0 ? (
          <div className={classes.empty}>
            <h2 className={classes.emptyTitle}>Nothing matches that search.</h2>
            <p className={classes.emptyText}>
              Try a broader term, or add a fresh snippet to start shaping the archive.
            </p>
          </div>
        ) : (
          snippets.map((snippet, index) => (
            <div
              key={snippet.id}
              className="snippet-stream-item"
              style={{ '--item-index': index } as React.CSSProperties}
            >
              <Snippet
                id={snippet.id}
                title={snippet.title}
                description={snippet.description}
                content={snippet.content}
                language={snippet.language}
                onDelete={onDelete}
                onEdit={onEdit}
                theme={theme}
              />
            </div>
          ))
        )}
      </div>

      {editingId !== null && (
        <Modal
          closeModal={closeModal}
        >
          {editingSnippetError instanceof Error ? (
            <div className={classes.error}>
              {`Unable to load snippet: ${editingSnippetError.message}`}
            </div>
          ) : editingSnippetData ? (
            <>
              {updateError instanceof Error && (
                <div className="mb-4 rounded-[1.4rem] border border-[var(--color-danger)] bg-[var(--color-surface)] px-5 py-3 text-sm text-[var(--color-danger)]">
                  {`Save failed: ${updateError.message}`}
                </div>
              )}
              <SnippetForm
                defaultValues={editingSnippetData}
                isEditing
                onSubmit={updateSnippet}
                closeModal={closeModal}
              />
            </>
          ) : (
            <div className="flex min-h-[12rem] items-center justify-center rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
              <SpinFigure />
            </div>
          )}
        </Modal>
      )}

    </section>
  );
};

export default Snippets;
