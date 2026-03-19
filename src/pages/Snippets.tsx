/* eslint-disable max-len */
import React, { useContext, useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { gsap } from 'gsap';
import Snippet from '../components/Snippet';
import { Snippet as ISnippet, SnippetFormValues, SnippetId } from '../types';
import Searchbar, { SearchbarHandle } from '../components/Searchbar';
import { SpinFigure } from '../components/Spinner';
import SnippetForm from '../components/SnippetForm';
import Modal from '../components/Modal';
import { ThemeContext } from '../contexts/themeContext';
import { useSnippet, snippetKeys } from '../hooks/react-query';
import { useDebounce } from '../utils/utils';
import useReactQuery from '../hooks/useReactQuery';
import { capitalize } from '../utils/helpers';
import Toast from '../components/Toast';
import { DEFAULT_SNIPPET_LAYOUT, SnippetLayout } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import { computeCardWidth } from '../utils/snippetLayout';
import { useDeleteSnippetMutation, useUpdateSnippetMutation } from '../hooks/useSnippetMutations';

const LayoutGridIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
    <rect x="0" y="0" width="4.5" height="4.5" rx="1" />
    <rect x="6.5" y="0" width="4.5" height="4.5" rx="1" />
    <rect x="0" y="6.5" width="4.5" height="4.5" rx="1" />
    <rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1" />
  </svg>
);

const LayoutMasonryIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
    <rect x="0" y="0" width="4.5" height="7" rx="1" />
    <rect x="6.5" y="0" width="4.5" height="4.5" rx="1" />
    <rect x="0" y="8.5" width="4.5" height="2.5" rx="1" />
    <rect x="6.5" y="6" width="4.5" height="5" rx="1" />
  </svg>
);

const LayoutStreamIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
    <rect x="0" y="0" width="11" height="2.8" rx="1" />
    <rect x="0" y="4.1" width="11" height="2.8" rx="1" />
    <rect x="0" y="8.2" width="11" height="2.8" rx="1" />
  </svg>
);

const LayoutCascadeIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
    <rect x="0" y="0" width="11" height="2.4" rx="1" />
    <rect x="0" y="4.1" width="5.1" height="2.4" rx="1" />
    <rect x="5.9" y="4.1" width="5.1" height="2.4" rx="1" />
    <rect x="0" y="8.2" width="2.8" height="2.4" rx="1" />
    <rect x="4.1" y="8.2" width="2.8" height="2.4" rx="1" />
    <rect x="8.2" y="8.2" width="2.8" height="2.4" rx="1" />
  </svg>
);

const LAYOUT_CLASSES: Record<Exclude<SnippetLayout, 'cascade'>, string> = {
  stream:  'mt-12 flex flex-col gap-14 md:mt-16 md:gap-20',
  grid:    'mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:mt-16 md:gap-10',
  masonry: 'mt-12 sm:columns-2 xl:columns-3 gap-8 md:mt-16 md:gap-10',
};


const CASCADE_PATTERN = [1, 2, 3];
const CASCADE_ROW_COLS = ['grid-cols-1', 'grid-cols-1 sm:grid-cols-2', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'];

function groupByCascade<T>(items: T[]): T[][] {
  const groups: T[][] = [];
  let i = 0;
  let p = 0;
  while (i < items.length) {
    const size = CASCADE_PATTERN[p % CASCADE_PATTERN.length];
    groups.push(items.slice(i, i + size));
    i += size;
    p++;
  }
  return groups;
}

type CascadeGridProps = {
  snippets: ISnippet[];
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
  prefetch: (id: SnippetId) => void;
  isFavorite: (id: SnippetId) => boolean;
  onToggleFavorite: (id: SnippetId) => void;
};

const CascadeGrid: React.FC<CascadeGridProps> = ({ snippets, onDelete, onEdit, theme, prefetch, isFavorite, onToggleFavorite }) => {
  const rows = groupByCascade(snippets);
  let absoluteIndex = 0;

  return (
    <div className="mt-12 flex flex-col gap-8 md:mt-16 md:gap-10">
      {rows.map((row, rowIndex) => {
        const patternIdx = rowIndex % CASCADE_PATTERN.length;
        const colClass = CASCADE_ROW_COLS[patternIdx];
        const rowStart = absoluteIndex;
        absoluteIndex += row.length;

        return (
          <div key={rowIndex} className={`grid gap-8 md:gap-10 ${colClass}`}>
            {row.map((snippet, colIndex) => (
              <div
                key={snippet.id}
                className="snippet-stream-item"
                style={{ '--item-index': rowStart + colIndex } as React.CSSProperties}
                onMouseEnter={() => prefetch(snippet.id)}
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
                  compact={patternIdx > 0}
                  isFavorite={isFavorite(snippet.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

type AutoSizeGridProps = {
  snippets: ISnippet[];
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
  prefetch: (id: SnippetId) => void;
  isFavorite: (id: SnippetId) => boolean;
  onToggleFavorite: (id: SnippetId) => void;
};

const AutoSizeGrid: React.FC<AutoSizeGridProps> = ({ snippets, onDelete, onEdit, theme, prefetch, isFavorite, onToggleFavorite }) => (
  <div className="mt-12 flex flex-wrap items-start gap-8 md:mt-16 md:gap-10">
    {snippets.map((snippet, index) => (
      <div
        key={snippet.id}
        className="snippet-stream-item"
        style={{
          '--item-index': index,
          width: `min(${computeCardWidth(snippet.content)}px, 100%)`,
          flexShrink: 0,
          transition: `width 0.5s cubic-bezier(0.4,0,0.2,1) ${index * 22}ms`,
        } as React.CSSProperties}
        onMouseEnter={() => prefetch(snippet.id)}
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
          compact={false}
          isFavorite={isFavorite(snippet.id)}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    ))}
  </div>
);


type Props = { searchbarRef?: RefObject<SearchbarHandle | null> };

const Snippets: React.FC<Props> = ({ searchbarRef }) => {
  const queryClient = useQueryClient();
  const { theme, autoSize, setAutoSize } = useContext(ThemeContext);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const gridRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<SnippetId | null>(null);
  const [search, setSearch] = useState<string>('');
  const [layout, setLayout] = useState<SnippetLayout>(
    () => (localStorage.getItem('snippetLayout') as SnippetLayout | null) ?? DEFAULT_SNIPPET_LAYOUT,
  );

  const handleLayoutChange = (next: SnippetLayout) => {
    setLayout(next);
    localStorage.setItem('snippetLayout', next);
  };

  const handleAutoSizeToggle = useCallback(() => {
    const items = gridRef.current?.querySelectorAll<HTMLElement>('.snippet-stream-item');
    if (items && items.length > 0) {
      gsap.to(Array.from(items), {
        opacity: 0,
        y: 8,
        duration: 0.18,
        stagger: 0.015,
        ease: 'power2.in',
        onComplete: () => {
          setAutoSize(!autoSize);
          gsap.fromTo(
            Array.from(gridRef.current?.querySelectorAll<HTMLElement>('.snippet-stream-item') ?? []),
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.32, stagger: 0.03, ease: 'power2.out', delay: 0.04 },
          );
        },
      });
    } else {
      setAutoSize(!autoSize);
    }
  }, [autoSize, setAutoSize]);
  const {
    data: editingSnippetData,
    error: editingSnippetError,
  } = useSnippet(editingId);
  const {
    mutate: removeSnippet,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteSnippetMutation();
  const {
    mutate: updateSnippetMutation,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateSnippetMutation({ onMutate: () => setEditingId(null) });
  // Capture edit-load error before editingId → null disables the query and clears it
  const [capturedEditError, setCapturedEditError] = useState<string | null>(null);
  useEffect(() => {
    if (editingSnippetError instanceof Error) {
      setCapturedEditError(editingSnippetError.message);
      setEditingId(null);
    }
  }, [editingSnippetError]);

  const debouncedSearchQuery = useDebounce(search, 600);
  // isLoadingResults: true while debounce is pending OR API is fetching
  const isLoadingResults = useReactQuery(debouncedSearchQuery).isPending || debouncedSearchQuery !== search;
  const { data: snippets = [], error } = useReactQuery(debouncedSearchQuery);

  const isSearching = Boolean(search);

  const sectionRef = useRef<HTMLElement>(null);

  const onDelete = (id: SnippetId) => removeSnippet(id);
  const onEdit = (id: SnippetId) => setEditingId(id);
  const onSearch = (value: string) => setSearch(value);
  const closeModal = () => { setEditingId(null); resetUpdate(); setCapturedEditError(null); };

  const updateSnippet = (formValues: SnippetFormValues) => {
    if (!editingSnippetData) return;
    updateSnippetMutation({ ...editingSnippetData, ...formValues });
  };

  return (
    <section ref={sectionRef} className="w-full">
      <Searchbar
        ref={searchbarRef}
        onSearch={onSearch}
        results={snippets}
        isLoadingResults={isLoadingResults}
        isSearching={isSearching}
        debouncedQuery={debouncedSearchQuery}
      />

      {/* ── Layout toggle ── */}
      {!isSearching && (
        <div className="mt-6 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={handleAutoSizeToggle}
            title="Auto-size cards to content width"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.20em] transition duration-200 ${
              autoSize
                ? 'border-[oklch(0.62_0.16_240_/_0.6)] bg-[oklch(0.62_0.16_240_/_0.12)] text-[var(--color-accent-bright)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
              <rect x="0" y="0" width="3.5" height="11" rx="1" />
              <rect x="4.5" y="2" width="6.5" height="7" rx="1" />
              <rect x="4.5" y="0" width="1" height="2.5" rx="0.5" />
              <rect x="4.5" y="8.5" width="1" height="2.5" rx="0.5" />
            </svg>
            Auto
          </button>
          <div className="mx-1 h-4 w-px bg-[var(--color-border)]" />
          {(['cascade', 'grid', 'masonry', 'stream'] as SnippetLayout[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleLayoutChange(l)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.20em] transition duration-200 ${
                !autoSize && layout === l
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] text-[var(--color-text)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]'
              }`}
            >
              {l === 'grid' && <LayoutGridIcon />}
              {l === 'masonry' && <LayoutMasonryIcon />}
              {l === 'stream' && <LayoutStreamIcon />}
              {l === 'cascade' && <LayoutCascadeIcon />}
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── Snippet grid / stream / masonry / cascade / auto ── */}
      {snippets.length === 0 ? (
        <p className="search-results-status mt-12" style={{ paddingTop: '1rem' }}>
          {isSearching ? `No snippets matched "${debouncedSearchQuery}"` : 'No snippets yet — create one to get started.'}
        </p>
      ) : autoSize ? (
        <div ref={gridRef}>
          <AutoSizeGrid
            snippets={snippets}
            onDelete={onDelete}
            onEdit={onEdit}
            theme={theme}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            prefetch={(id) => queryClient.prefetchQuery({
              queryKey: snippetKeys.detail(id),
              queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${id}`)),
              staleTime: 60_000,
            })}
          />
        </div>
      ) : layout === 'cascade' ? (
        <div ref={gridRef}>
          <CascadeGrid
            snippets={snippets}
            onDelete={onDelete}
            onEdit={onEdit}
            theme={theme}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            prefetch={(id) => queryClient.prefetchQuery({
              queryKey: snippetKeys.detail(id),
              queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${id}`)),
              staleTime: 60_000,
            })}
          />
        </div>
      ) : (
        <div ref={gridRef} className={LAYOUT_CLASSES[layout as Exclude<SnippetLayout, 'cascade'>]}>
          {snippets.map((snippet, index) => (
            <div
              key={snippet.id}
              className={layout === 'masonry' ? 'break-inside-avoid mb-8 md:mb-10' : 'snippet-stream-item'}
              style={layout === 'stream' ? ({ '--item-index': index } as React.CSSProperties) : undefined}
              onMouseEnter={() => queryClient.prefetchQuery({
                queryKey: snippetKeys.detail(snippet.id),
                queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${snippet.id}`)),
                staleTime: 60_000,
              })}
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
                compact={layout !== 'stream'}
                isFavorite={isFavorite(snippet.id)}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          ))}
        </div>
      )}

      {editingId !== null && (
        <Modal closeModal={closeModal}>
          {editingSnippetData ? (
            <SnippetForm
              defaultValues={editingSnippetData}
              isEditing
              onSubmit={updateSnippet}
              closeModal={closeModal}
            />
          ) : (
            <div className="flex min-h-[12rem] items-center justify-center rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
              <SpinFigure />
            </div>
          )}
        </Modal>
      )}

      {/* ── Error toasts ── */}
      {error instanceof Error && (
        <Toast
          variant="error"
          message={`Could not load snippets: ${error.message}`}
          onDismiss={() => { /* query manages its own error state */ }}
        />
      )}
      {deleteError instanceof Error && (
        <Toast
          variant="error"
          message="Delete failed — snippet was restored"
          onDismiss={resetDelete}
        />
      )}
      {capturedEditError && (
        <Toast
          variant="error"
          message={`Could not load snippet: ${capturedEditError}`}
          onDismiss={() => setCapturedEditError(null)}
        />
      )}
      {updateError instanceof Error && (
        <Toast
          variant="error"
          message={`Save failed: ${updateError.message}`}
          onDismiss={resetUpdate}
        />
      )}

    </section>
  );
};

export default Snippets;
