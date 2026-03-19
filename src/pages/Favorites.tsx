/* eslint-disable max-len */
import React, { useContext, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import Kicker from '../components/Kicker';
import { gsap } from 'gsap';
import { ThemeContext } from '../contexts/themeContext';
import { useFavorites } from '../hooks/useFavorites';
import { useSnippets } from '../hooks/react-query';
import { Snippet as ISnippet, SnippetFormValues, SnippetId } from '../types';
import { useDeleteSnippetMutation, useUpdateSnippetMutation } from '../hooks/useSnippetMutations';
import Snippet from '../components/Snippet';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { SpinFigure } from '../components/Spinner';
import Toast from '../components/Toast';
import { computeCardWidth } from '../utils/snippetLayout';

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
};


const Favorites: React.FC = () => {
  const { theme, autoSize } = useContext(ThemeContext);
  const gridRef = useRef<HTMLDivElement>(null);
  const { favorites, isFavorite, toggle: toggleFavorite } = useFavorites();
  const [editingSnippet, setEditingSnippet] = useState<ISnippet | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { data: allSnippets = [], isPending } = useSnippets({});
  const favoriteSnippets = allSnippets.filter((s) => isFavorite(s.id));

  const { mutate: removeSnippet } = useDeleteSnippetMutation({
    onError: () => setDeleteError('Delete failed — snippet was restored'),
  });
  const { mutate: updateSnippetMutation } = useUpdateSnippetMutation({
    onMutate: () => setEditingSnippet(null),
    onError: () => setUpdateError('Save failed — changes were reverted'),
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
        <GlassPill as={Link} to="/" size="md">
          <i className="icon-home" style={{ fontSize: '0.85em' }} />
          Back to archive
        </GlassPill>

        <header className="mt-12 md:mt-16">
          <Kicker>Your collection</Kicker>
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
