/* eslint-disable max-len */
import React, { useContext, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ThemeContext } from '../contexts/themeContext';
import { useFavorites } from '../hooks/useFavorites';
import { useSnippets } from '../hooks/react-query';
import { update, remove } from '../utils/api.ts';
import { Snippet as ISnippet, SnippetFormValues, SnippetId } from '../types';
import {
  invalidateSnippetQueries,
  removeSnippetFromLists,
  restoreSnippetLists,
  snapshotSnippetLists,
  snapshotAndPatchSnippet,
  restoreSnippetDetail,
  SnippetListSnapshot,
  SnippetDetailSnapshot,
} from '../utils/snippetQueryCache';
import Snippet from '../components/Snippet';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { SpinFigure } from '../components/Spinner';
import Toast from '../components/Toast';

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
  back: 'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
};

function computeCardWidth(content: string): number {
  const longestLine = content.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
  return Math.max(480, Math.min(1400, longestLine * 10.5 + 160));
}

const Favorites: React.FC = () => {
  const queryClient = useQueryClient();
  const { theme, autoSize } = useContext(ThemeContext);
  const gridRef = useRef<HTMLDivElement>(null);
  const { favorites, isFavorite, toggle: toggleFavorite } = useFavorites();
  const [editingSnippet, setEditingSnippet] = useState<ISnippet | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { data: allSnippets = [], isPending } = useSnippets('');
  const favoriteSnippets = allSnippets.filter((s) => isFavorite(s.id));

  const { mutate: removeSnippet } = useMutation<void, Error, SnippetId, { previousSnippets: SnippetListSnapshot }>({
    mutationFn: (id) => remove('snippets', id),
    onMutate: async (id) => {
      const previousSnippets = await snapshotSnippetLists(queryClient);
      removeSnippetFromLists(queryClient, id);
      return { previousSnippets };
    },
    onError: (_error, _id, context) => {
      restoreSnippetLists(queryClient, context?.previousSnippets);
      setDeleteError('Delete failed — snippet was restored');
    },
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
    },
  });

  const { mutate: updateSnippetMutation } = useMutation<ISnippet, Error, ISnippet, { lists: SnippetListSnapshot; detail: SnippetDetailSnapshot }>({
    mutationFn: (data) => update<ISnippet, ISnippet>(`snippets/${data.id}`, data),
    onMutate: async (updated) => {
      const snapshot = await snapshotAndPatchSnippet(queryClient, updated);
      setEditingSnippet(null);
      return snapshot;
    },
    onError: (_error, _updated, context) => {
      restoreSnippetLists(queryClient, context?.lists);
      if (context?.detail) restoreSnippetDetail(queryClient, context.detail);
      setUpdateError('Save failed — changes were reverted');
    },
    onSuccess: async () => {
      await invalidateSnippetQueries(queryClient);
    },
  });

  const handleEdit = (id: SnippetId) => {
    const snippet = allSnippets.find((s) => s.id === id) ?? null;
    setEditingSnippet(snippet);
  };

  const handleUpdate = (formValues: SnippetFormValues) => {
    if (!editingSnippet) return;
    updateSnippetMutation({ ...editingSnippet, ...formValues });
  };

  return (
    <div className="App">
      <div className={classes.shell}>
        <Link to="/" className={classes.back}>
          <i className="icon-home" style={{ fontSize: '0.85em' }} />
          Back to archive
        </Link>

        <header className="mt-12 md:mt-16">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel">
            Your collection
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-6xl lg:text-7xl text-bevel-strong">
            Favorites
          </h1>
          {favorites.length > 0 && (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {favorites.length} saved {favorites.length === 1 ? 'snippet' : 'snippets'}
            </p>
          )}
        </header>

        <div className="mt-12 md:mt-16">
          {isPending ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <SpinFigure />
            </div>
          ) : favoriteSnippets.length === 0 ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
              <i className="icon-star-empty text-4xl text-[var(--color-text-subtle)]" />
              <p className="text-[var(--color-text-muted)]">No favorites yet.</p>
              <p className="text-sm text-[var(--color-text-subtle)]">
                Save snippets from the archive using the{' '}
                <span className="font-semibold text-[var(--color-text-muted)]">Save</span> button.
              </p>
            </div>
          ) : (
            <div
              ref={gridRef}
              className={autoSize ? 'flex flex-wrap items-start gap-8 md:gap-10' : 'flex flex-col gap-14 md:gap-20'}
            >
              {favoriteSnippets.map((snippet, index) => (
                <div
                  key={snippet.id}
                  className="snippet-stream-item"
                  style={autoSize ? {
                    '--item-index': index,
                    width: `min(${computeCardWidth(snippet.content)}px, 100%)`,
                    flexShrink: 0,
                    transition: `width 0.5s cubic-bezier(0.4,0,0.2,1) ${index * 22}ms`,
                  } as React.CSSProperties : { '--item-index': index } as React.CSSProperties}
                >
                  <Snippet
                    id={snippet.id}
                    title={snippet.title}
                    description={snippet.description}
                    content={snippet.content}
                    language={snippet.language}
                    onDelete={(id) => removeSnippet(id)}
                    onEdit={handleEdit}
                    theme={theme}
                    isFavorite={isFavorite(snippet.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingSnippet && (
        <Modal closeModal={() => setEditingSnippet(null)}>
          <SnippetForm
            defaultValues={editingSnippet}
            isEditing
            onSubmit={handleUpdate}
            closeModal={() => setEditingSnippet(null)}
          />
        </Modal>
      )}

      {deleteError && (
        <Toast variant="error" message={deleteError} onDismiss={() => setDeleteError(null)} />
      )}
      {updateError && (
        <Toast variant="error" message={updateError} onDismiss={() => setUpdateError(null)} />
      )}
    </div>
  );
};

export default Favorites;
