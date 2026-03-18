/* eslint-disable max-len */
import React, { useContext, useState, RefObject } from 'react';
import { Link } from 'react-router-dom';
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
import { capitalize } from '../utils/helpers';
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
  // isLoadingResults: true while debounce is pending OR API is fetching
  const isLoadingResults = useReactQuery(debouncedSearchQuery).isPending || debouncedSearchQuery !== search;
  const { data: snippets = [], error } = useReactQuery(debouncedSearchQuery);

  const isSearching = Boolean(search);

  const onDelete = (id: SnippetId) => removeSnippet(id);
  const onEdit = (id: SnippetId) => setEditingId(id);
  const onSearch = (value: string) => setSearch(value);
  const closeModal = () => { setEditingId(null); resetUpdate(); };

  const updateSnippet = (formValues: SnippetFormValues) => {
    if (!editingSnippetData) return;
    updateSnippetMutation({ ...editingSnippetData, ...formValues });
  };

  if (error instanceof Error) {
    return <div className={classes.error}>An error has occurred: {error.message}</div>;
  }

  return (
    <section className={classes.container}>
      <Searchbar ref={searchbarRef} onSearch={onSearch} />

      {/* ── Compact search results — slides in/out via grid-template-rows trick ── */}
      <div className={`search-results-wrap${isSearching ? ' open' : ''}`}>
        <div>
          {isLoadingResults ? (
            <p className="search-results-status">Searching…</p>
          ) : snippets.length === 0 ? (
            <p className="search-results-status">No snippets matched &ldquo;{debouncedSearchQuery}&rdquo;</p>
          ) : (
            <ul className="search-results-list">
              {snippets.map((snippet) => (
                <li key={snippet.id} className="search-result-item">
                  <Link to={`/snippets/${snippet.id}`} className="search-result-link">
                    <span className="search-result-title">{capitalize(snippet.title || 'Untitled snippet')}</span>
                    <span className="search-result-lang">{snippet.language || 'plaintext'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Full snippet stream — only when not searching ── */}
      {!isSearching && (
        <div className={classes.stream}>
          {snippets.map((snippet, index) => (
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
          ))}
        </div>
      )}

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
