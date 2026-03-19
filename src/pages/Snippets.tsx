/* eslint-disable max-len */
import React, { useContext, useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { gsap } from 'gsap';
import Snippet from '../components/Snippet';
import GlassPanel from '../components/GlassPanel';
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
import { DEFAULT_SNIPPET_LAYOUT, LANGUAGE_MAP, SnippetLayout } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import { computeCardWidth } from '../utils/snippetLayout';
import { useDeleteSnippetMutation, useUpdateSnippetMutation } from '../hooks/useSnippetMutations';
import { Masonry } from 'masonic';

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

// ── Masonry (masonic) ─────────────────────────────────────────────────────────
// masonic requires a stable render component — callbacks are passed through
// context so the component reference never changes between renders.

type MasonryCallbacks = {
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
  isFavorite: (id: SnippetId) => boolean;
  onToggleFavorite: (id: SnippetId) => void;
  onFilterLanguage: (lang: string) => void;
  prefetch: (id: SnippetId) => void;
};

const MasonryContext = React.createContext<MasonryCallbacks | null>(null);

const MasonryCard = React.memo(({ data }: { data: ISnippet; width: number; index: number }) => {
  const ctx = React.useContext(MasonryContext)!;
  return (
    <div onMouseEnter={() => ctx.prefetch(data.id)}>
      <Snippet
        id={data.id}
        title={data.title}
        description={data.description}
        content={data.content}
        language={data.language}
        onDelete={ctx.onDelete}
        onEdit={ctx.onEdit}
        theme={ctx.theme}
        compact
        isFavorite={ctx.isFavorite(data.id)}
        onToggleFavorite={ctx.onToggleFavorite}
        onFilterLanguage={ctx.onFilterLanguage}
      />
    </div>
  );
});

type MasonryGridProps = MasonryCallbacks & { snippets: ISnippet[] };

const MasonryGrid: React.FC<MasonryGridProps> = ({
  snippets, onDelete, onEdit, theme, isFavorite, onToggleFavorite, onFilterLanguage, prefetch,
}) => (
  <MasonryContext.Provider value={{ onDelete, onEdit, theme, isFavorite, onToggleFavorite, onFilterLanguage, prefetch }}>
    <div className="mt-12 md:mt-16">
      <Masonry
        items={snippets}
        render={MasonryCard}
        columnGutter={32}
        columnWidth={380}
        overscanBy={2}
        itemKey={(item) => item.id}
      />
    </div>
  </MasonryContext.Provider>
);

const LAYOUT_CLASSES: Record<'stream' | 'grid', string> = {
  stream: 'mt-12 flex flex-col gap-14 md:mt-16 md:gap-20',
  grid:   'mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:mt-16 md:gap-10',
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
  onFilterLanguage: (lang: string) => void;
};

const CascadeGrid: React.FC<CascadeGridProps> = ({ snippets, onDelete, onEdit, theme, prefetch, isFavorite, onToggleFavorite, onFilterLanguage }) => {
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
                  onFilterLanguage={onFilterLanguage}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ── Variable-width masonry (Auto layout) ─────────────────────────────────────
// Cards are classified as 1-column or 2-column wide based on content length.
// A greedy shortest-column packing algorithm places them with absolute positions,
// so both column-span and card height drive the final layout.

const AUTO_GUTTER = 32;    // px — matches gap-8
const AUTO_BASE_COL = 420; // px — minimum column width
// Snippets whose ideal width exceeds this threshold get a 2-column span.
const WIDE_THRESHOLD = 620;

function colSpanForSnippet(content: string): 1 | 2 {
  return computeCardWidth(content) >= WIDE_THRESHOLD ? 2 : 1;
}

/** Greedy shortest-column packing that supports 1- and 2-column spans. */
function packVariableWidth(
  spans: (1 | 2)[],
  heights: number[],
  colCount: number,
  colWidth: number,
): Array<{ left: number; top: number; width: number }> {
  const colHeights = new Array<number>(colCount).fill(0);
  return spans.map((rawSpan, i) => {
    const span = Math.min(rawSpan, colCount) as 1 | 2;
    // Find the starting column that minimises the max height of occupied slots.
    let bestCol = 0;
    let bestH = Infinity;
    for (let c = 0; c <= colCount - span; c++) {
      const h = span === 1 ? colHeights[c] : Math.max(colHeights[c], colHeights[c + 1]);
      if (h < bestH) { bestH = h; bestCol = c; }
    }
    const left = bestCol * (colWidth + AUTO_GUTTER);
    const top = bestH;
    const width = span * colWidth + (span - 1) * AUTO_GUTTER;
    const nextH = top + heights[i] + AUTO_GUTTER;
    for (let c = bestCol; c < bestCol + span; c++) colHeights[c] = nextH;
    return { left, top, width };
  });
}

type AutoSizeGridProps = {
  snippets: ISnippet[];
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
  prefetch: (id: SnippetId) => void;
  isFavorite: (id: SnippetId) => boolean;
  onToggleFavorite: (id: SnippetId) => void;
  onFilterLanguage: (lang: string) => void;
};

const AutoSizeGrid: React.FC<AutoSizeGridProps> = ({
  snippets, onDelete, onEdit, theme, prefetch, isFavorite, onToggleFavorite, onFilterLanguage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);

  // Track container width for responsive column count.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setContainerWidth(el.offsetWidth));
    obs.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  // Measure rendered item heights; ResizeObserver fires on first observe too,
  // so this doubles as the initial measurement pass.
  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const h = itemRefs.current.map((el) => el?.offsetHeight ?? 0);
      setItemHeights((prev) => (prev.length === h.length && prev.every((v, i) => v === h[i]) ? prev : h));
    });
    itemRefs.current.forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippets]);

  const colCount = Math.max(1, Math.floor((containerWidth + AUTO_GUTTER) / (AUTO_BASE_COL + AUTO_GUTTER)));
  const colWidth = containerWidth > 0
    ? (containerWidth - (colCount - 1) * AUTO_GUTTER) / colCount
    : AUTO_BASE_COL;

  const spans = snippets.map((s) => colSpanForSnippet(s.content));
  const isPositioned = itemHeights.length === snippets.length && itemHeights.every((h) => h > 0);
  const positions = isPositioned ? packVariableWidth(spans, itemHeights, colCount, colWidth) : null;
  const totalHeight = positions
    ? Math.max(...positions.map((p, i) => p.top + itemHeights[i]))
    : undefined;

  return (
    <div
      ref={containerRef}
      className="mt-12 md:mt-16"
      style={{ position: 'relative', height: totalHeight, overflow: isPositioned ? 'visible' : 'hidden' }}
    >
      {snippets.map((snippet, i) => {
        const pos = positions?.[i];
        const span = spans[i];
        const w = pos?.width ?? (span * colWidth + (span - 1) * AUTO_GUTTER);
        return (
          <div
            key={snippet.id}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="snippet-stream-item"
            onMouseEnter={() => prefetch(snippet.id)}
            style={{
              position: pos ? 'absolute' : 'relative',
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              width: `min(${w}px, 100%)`,
              opacity: pos ? 1 : 0,
              transition: pos ? 'opacity 0.35s ease, top 0.45s cubic-bezier(0.4,0,0.2,1), left 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none',
            } as React.CSSProperties}
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
              compact={span === 1}
              isFavorite={isFavorite(snippet.id)}
              onToggleFavorite={onToggleFavorite}
              onFilterLanguage={onFilterLanguage}
            />
          </div>
        );
      })}
    </div>
  );
};


type Props = { searchbarRef?: RefObject<SearchbarHandle | null> };

const Snippets: React.FC<Props> = ({ searchbarRef }) => {
  const queryClient = useQueryClient();
  const { theme, autoSize, setAutoSize } = useContext(ThemeContext);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const gridRef = useRef<HTMLDivElement>(null);
  const lastEditingIdRef = useRef<SnippetId | null>(null);
  const [editingId, setEditingId] = useState<SnippetId | null>(null);
  const [search, setSearch] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);
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
  } = useUpdateSnippetMutation({
    onMutate: () => { lastEditingIdRef.current = editingId; setEditingId(null); },
    onError: () => setEditingId(lastEditingIdRef.current),
  });
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
  const onSearch = (value: string) => { setSearch(value); setLanguageFilter(null); };
  const closeModal = () => { setEditingId(null); resetUpdate(); setCapturedEditError(null); };

  const displaySnippets = languageFilter
    ? snippets.filter((s) => s.language === languageFilter)
    : snippets;
  const onFilterLanguage = (lang: string) => setLanguageFilter((prev) => (prev === lang ? null : lang));

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

      {/* ── Language filter chip ── */}
      {languageFilter && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">Filtered by</span>
          <button
            type="button"
            onClick={() => setLanguageFilter(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.62_0.16_240_/_0.5)] bg-[oklch(0.62_0.16_240_/_0.10)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.20em] text-[var(--color-accent-bright)] text-bevel backdrop-blur-md transition duration-200 hover:bg-[oklch(0.62_0.16_240_/_0.18)]"
          >
            {LANGUAGE_MAP[languageFilter as keyof typeof LANGUAGE_MAP] ?? languageFilter}
            <span aria-hidden="true" className="opacity-60">×</span>
          </button>
        </div>
      )}

      {/* ── Layout toggle ── */}
      {!isSearching && (
        <div className="mt-6 flex justify-end">
        <GlassPanel intensity="subtle" rounded="rounded-[1.4rem]" className="inline-flex items-center gap-1.5 px-3 py-2.5">
          <button
            type="button"
            onClick={handleAutoSizeToggle}
            title="Auto-size cards to content width"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.20em] text-bevel backdrop-blur-md transition duration-200 ${
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
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.20em] text-bevel backdrop-blur-md transition duration-200 ${
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
        </GlassPanel>
        </div>
      )}

      {/* ── Snippet grid / stream / masonry / cascade / auto ── */}
      {displaySnippets.length === 0 ? (
        <p className="search-results-status mt-12" style={{ paddingTop: '1rem' }}>
          {languageFilter
            ? `No snippets with language "${LANGUAGE_MAP[languageFilter as keyof typeof LANGUAGE_MAP] ?? languageFilter}"`
            : isSearching ? `No snippets matched "${debouncedSearchQuery}"` : 'No snippets yet — create one to get started.'}
        </p>
      ) : autoSize ? (
        <div ref={gridRef}>
          <AutoSizeGrid
            snippets={displaySnippets}
            onDelete={onDelete}
            onEdit={onEdit}
            theme={theme}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onFilterLanguage={onFilterLanguage}
            prefetch={(id) => queryClient.prefetchQuery({
              queryKey: snippetKeys.detail(id),
              queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${id}`)),
              staleTime: 60_000,
            })}
          />
        </div>
      ) : layout === 'masonry' ? (
        <MasonryGrid
          snippets={displaySnippets}
          onDelete={onDelete}
          onEdit={onEdit}
          theme={theme}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onFilterLanguage={onFilterLanguage}
          prefetch={(id) => queryClient.prefetchQuery({
            queryKey: snippetKeys.detail(id),
            queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${id}`)),
            staleTime: 60_000,
          })}
        />
      ) : layout === 'cascade' ? (
        <div ref={gridRef}>
          <CascadeGrid
            snippets={displaySnippets}
            onDelete={onDelete}
            onEdit={onEdit}
            theme={theme}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onFilterLanguage={onFilterLanguage}
            prefetch={(id) => queryClient.prefetchQuery({
              queryKey: snippetKeys.detail(id),
              queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${id}`)),
              staleTime: 60_000,
            })}
          />
        </div>
      ) : (
        <div ref={gridRef} className={LAYOUT_CLASSES[layout as 'stream' | 'grid']}>
          {displaySnippets.map((snippet, index) => (
            <div
              key={snippet.id}
              className="snippet-stream-item"
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
                onFilterLanguage={onFilterLanguage}
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
            <GlassPanel intensity="medium" className="flex min-h-[12rem] items-center justify-center p-8">
              <SpinFigure />
            </GlassPanel>
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
