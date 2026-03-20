/* eslint-disable max-len */
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useTransition,
  RefObject,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Snippet from '../components/Snippet';
import { GlassPanel, GlassPill } from 'glass-design-system';
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
import Chip from '../components/Chip';
import { useFavorites } from '../hooks/useFavorites';
import { computeCardWidth } from '../utils/snippetLayout';
import { useDeleteSnippetMutation, useUpdateSnippetMutation } from '../hooks/useSnippetMutations';
import { Masonry } from 'masonic';
import Icon from '../components/Icon';

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
  snippets,
  onDelete,
  onEdit,
  theme,
  isFavorite,
  onToggleFavorite,
  onFilterLanguage,
  prefetch,
}) => (
  <MasonryContext.Provider
    value={{
      onDelete,
      onEdit,
      theme,
      isFavorite,
      onToggleFavorite,
      onFilterLanguage,
      prefetch,
    }}
  >
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
  grid: 'mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:mt-16 md:gap-10',
};

const CASCADE_PATTERN = [1, 2, 3, 2];
const CASCADE_ROW_COLS = [
  'grid-cols-1',
  'grid-cols-1 sm:grid-cols-2',
  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
];

// Set to true after Snippets first mounts. Survives React unmount/remount so
// subsequent visits (e.g. navigating back from a snippet) skip the stagger.
let snippetsLoaded = false;
export const _resetSnippetsLoaded = () => { snippetsLoaded = false; };

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

const CascadeGrid: React.FC<CascadeGridProps> = ({
  snippets,
  onDelete,
  onEdit,
  theme,
  prefetch,
  isFavorite,
  onToggleFavorite,
  onFilterLanguage,
}) => {
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
                className={snippetsLoaded ? undefined : 'snippet-stream-item'}
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

// ── Spotlight layout ──────────────────────────────────────────────────────────
// First snippet rendered full-size as a hero; the rest in a compact 3-col grid.

type SpotlightGridProps = {
  snippets: ISnippet[];
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
  prefetch: (id: SnippetId) => void;
  isFavorite: (id: SnippetId) => boolean;
  onToggleFavorite: (id: SnippetId) => void;
  onFilterLanguage: (lang: string) => void;
};

const SpotlightGrid: React.FC<SpotlightGridProps> = ({
  snippets, onDelete, onEdit, theme, prefetch, isFavorite, onToggleFavorite, onFilterLanguage,
}) => {
  const [hero, ...rest] = snippets;
  return (
    <div className="mt-12 md:mt-16">
      {hero && (
        <div
          className={snippetsLoaded ? undefined : 'snippet-stream-item'}
          style={{ '--item-index': 0 } as React.CSSProperties}
          onMouseEnter={() => prefetch(hero.id)}
        >
          <Snippet
            id={hero.id} title={hero.title} description={hero.description}
            content={hero.content} language={hero.language}
            onDelete={onDelete} onEdit={onEdit} theme={theme} compact={false}
            isFavorite={isFavorite(hero.id)} onToggleFavorite={onToggleFavorite}
            onFilterLanguage={onFilterLanguage}
          />
        </div>
      )}
      {rest.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
          {rest.map((snippet, index) => (
            <div
              key={snippet.id}
              className={snippetsLoaded ? undefined : 'snippet-stream-item'}
              style={{ '--item-index': index + 1 } as React.CSSProperties}
              onMouseEnter={() => prefetch(snippet.id)}
            >
              <Snippet
                id={snippet.id} title={snippet.title} description={snippet.description}
                content={snippet.content} language={snippet.language}
                onDelete={onDelete} onEdit={onEdit} theme={theme} compact
                isFavorite={isFavorite(snippet.id)} onToggleFavorite={onToggleFavorite}
                onFilterLanguage={onFilterLanguage}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Variable-width masonry (Auto layout) ─────────────────────────────────────
// Cards span 1–3 columns based on content length, always stretching to fill their
// span. A greedy shortest-column packing algorithm places them with absolute
// positions, so both column-span and card height drive the final layout.

const AUTO_GUTTER = 20; // px — gap between columns
const COL_MIN_WIDTH = 260; // px — below this per-column width, add more columns
const MIN_COLS = 5; // always at least 5 columns
const MAX_COLS = 6; // cap at 5 columns on very wide screens
// Set to true to animate card positions on reflow (resize / data changes).
// Currently disabled: position transitions cause a yank on initial layout pass.
const AUTO_REFLOW_ANIMATIONS = false;

/** Returns the minimum number of columns a snippet needs so its width is never
 *  squeezed below its natural content width. Cards are stretched to fill their
 *  exact column span — never smaller, but possibly wider than the natural size. */
function colSpanForSnippet(content: string, colCount: number, colWidth: number): 1 | 2 | 3 {
  const naturalWidth = computeCardWidth(content);
  const span = Math.ceil((naturalWidth + AUTO_GUTTER) / (colWidth + AUTO_GUTTER));
  return Math.max(1, Math.min(span, colCount, 3)) as 1 | 2 | 3;
}

/** Greedy shortest-column packing that supports 1-, 2-, and 3-column spans. */
function packVariableWidth(
  spans: (1 | 2 | 3)[],
  heights: number[],
  colCount: number,
  colWidth: number
): Array<{ left: number; top: number; width: number }> {
  const colHeights = new Array<number>(colCount).fill(0);
  return spans.map((rawSpan, i) => {
    const span = Math.min(rawSpan, colCount) as 1 | 2 | 3;
    // Find the starting column that minimises the max height of occupied slots.
    let bestCol = 0;
    let bestH = Infinity;
    for (let c = 0; c <= colCount - span; c++) {
      let h = colHeights[c];
      for (let s = 1; s < span; s++) h = Math.max(h, colHeights[c + s]);
      if (h < bestH) {
        bestH = h;
        bestCol = c;
      }
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
  snippets,
  onDelete,
  onEdit,
  theme,
  prefetch,
  isFavorite,
  onToggleFavorite,
  onFilterLanguage,
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
      setItemHeights((prev) =>
        prev.length === h.length && prev.every((v, i) => v === h[i]) ? prev : h
      );
    });
    itemRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippets]);

  const colCount =
    containerWidth > 0
      ? Math.min(
          MAX_COLS,
          Math.max(
            MIN_COLS,
            Math.floor((containerWidth + AUTO_GUTTER) / (COL_MIN_WIDTH + AUTO_GUTTER))
          )
        )
      : MIN_COLS;
  const colWidth =
    containerWidth > 0 ? (containerWidth - (colCount - 1) * AUTO_GUTTER) / colCount : COL_MIN_WIDTH;

  const spans = snippets.map((s) => colSpanForSnippet(s.content, colCount, colWidth));
  const isPositioned = itemHeights.length === snippets.length && itemHeights.every((h) => h > 0);
  const positions = isPositioned ? packVariableWidth(spans, itemHeights, colCount, colWidth) : null;
  const totalHeight = positions
    ? Math.max(...positions.map((p, i) => p.top + itemHeights[i]))
    : undefined;

  return (
    <div
      ref={containerRef}
      className="mt-12 md:mt-16"
      style={{
        position: 'relative',
        height: totalHeight,
        overflow: isPositioned ? 'visible' : 'hidden',
      }}
    >
      {snippets.map((snippet, i) => {
        const pos = positions?.[i];
        const span = spans[i];
        const w = pos?.width ?? span * colWidth + (span - 1) * AUTO_GUTTER;
        return (
          <div
            key={snippet.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={snippetsLoaded ? undefined : 'snippet-stream-item'}
            onMouseEnter={() => prefetch(snippet.id)}
            style={
              {
                position: pos ? 'absolute' : 'relative',
                left: pos?.left ?? 0,
                top: pos?.top ?? 0,
                width: `min(${w}px, 100%)`,
                opacity: pos ? 1 : 0,
                transition: pos
                  ? AUTO_REFLOW_ANIMATIONS
                    ? 'opacity 0.35s ease, top 0.45s cubic-bezier(0.4,0,0.2,1), left 0.45s cubic-bezier(0.4,0,0.2,1)'
                    : 'opacity 0.35s ease'
                  : 'none',
              } as React.CSSProperties
            }
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

type Props = {
  searchbarRef?: RefObject<SearchbarHandle | null>;
  initialLanguage?: string;
};

const Snippets: React.FC<Props> = ({ searchbarRef, initialLanguage }) => {
  const queryClient = useQueryClient();
  const { theme } = useContext(ThemeContext);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const gridRef = useRef<HTMLDivElement>(null);
  const lastEditingIdRef = useRef<SnippetId | null>(null);
  const [editingId, setEditingId] = useState<SnippetId | null>(null);
  const [search, setSearch] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string | null>(initialLanguage ?? null);
  const [isSearchTransitioning, startSearchTransition] = useTransition();
  const [layout, setLayout] = useState<SnippetLayout>(() => {
    const saved = localStorage.getItem('snippetLayout') as SnippetLayout | null;
    const valid: SnippetLayout[] = ['stream', 'grid', 'masonry', 'cascade', 'auto', 'spotlight'];
    if (saved && valid.includes(saved)) return saved;
    if (localStorage.getItem('autoSize') === 'true') return 'auto'; // migrate old flag
    return DEFAULT_SNIPPET_LAYOUT;
  });

  // Mark as loaded after first render so return visits skip the stagger.
  useEffect(() => {
    snippetsLoaded = true;
  }, []);

  const handleLayoutChange = useCallback((next: SnippetLayout) => {
    setLayout(next);
    localStorage.setItem('snippetLayout', next);
  }, []);

  const prefetch = useCallback((id: SnippetId) => {
    queryClient.prefetchQuery({
      queryKey: snippetKeys.detail(id),
      queryFn: () => import('../utils/api.ts').then(({ get }) => get<ISnippet>(`snippets/${id}`)),
      staleTime: 60_000,
    });
  }, [queryClient]);

  const { data: editingSnippetData, error: editingSnippetError } = useSnippet(editingId);
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
    onMutate: () => {
      lastEditingIdRef.current = editingId;
      setEditingId(null);
    },
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
  const snippetQueryParams = useMemo(
    () => ({ q: debouncedSearchQuery || undefined, language: languageFilter ?? undefined }),
    [debouncedSearchQuery, languageFilter]
  );
  // isLoadingResults: true while transition/debounce is pending OR API is fetching
  const isLoadingResults =
    useReactQuery(snippetQueryParams).isPending ||
    isSearchTransitioning ||
    debouncedSearchQuery !== search;
  const { data: snippets = [], error } = useReactQuery(snippetQueryParams);

  const isSearching = Boolean(search);

  const sectionRef = useRef<HTMLElement>(null);

  const onDelete = (id: SnippetId) => removeSnippet(id);
  const onEdit = (id: SnippetId) => setEditingId(id);
  const onSearch = (value: string) => {
    setLanguageFilter(null); // immediate — language chip disappears instantly
    startSearchTransition(() => {
      setSearch(value);
    }); // deferred — grid re-render is non-urgent
  };
  const closeModal = () => {
    setEditingId(null);
    resetUpdate();
    setCapturedEditError(null);
  };

  const displaySnippets = snippets;
  const onFilterLanguage = (lang: string) =>
    setLanguageFilter((prev) => (prev === lang ? null : lang));

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
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">
            Filtered by
          </span>
          <Chip variant="accent" size="md" onRemove={() => setLanguageFilter(null)}>
            {LANGUAGE_MAP[languageFilter as keyof typeof LANGUAGE_MAP] ?? languageFilter}
          </Chip>
        </div>
      )}

      {/* ── Layout toggle ── */}
      {!isSearching && (
        <div className="mt-6 flex justify-end">
          <GlassPanel
            intensity="subtle"
            rounded="rounded-[1.4rem]"
            className="inline-flex items-center gap-1.5 px-3 py-2.5"
          >
            {(['auto', 'spotlight', 'cascade', 'grid', 'masonry', 'stream'] as SnippetLayout[]).map((l) => (
              <GlassPill
                key={l}
                size="xs"
                variant={layout === l ? 'active' : 'default'}
                onClick={() => handleLayoutChange(l)}
              >
                {l === 'auto'      && <Icon name="layout-auto" />}
                {l === 'spotlight' && <Icon name="layout-spotlight" />}
                {l === 'cascade'   && <Icon name="layout-cascade" />}
                {l === 'grid'      && <Icon name="layout-grid" />}
                {l === 'masonry'   && <Icon name="layout-masonry" />}
                {l === 'stream'    && <Icon name="layout-stream" />}
                {l}
              </GlassPill>
            ))}
          </GlassPanel>
        </div>
      )}

      {/* ── Snippet grid / stream / masonry / cascade / auto ── */}
      {displaySnippets.length === 0 ? (
        <p className="search-results-status mt-12" style={{ paddingTop: '1rem' }}>
          {languageFilter
            ? `No snippets with language "${LANGUAGE_MAP[languageFilter as keyof typeof LANGUAGE_MAP] ?? languageFilter}"`
            : isSearching
              ? `No snippets matched "${debouncedSearchQuery}"`
              : 'No snippets yet — create one to get started.'}
        </p>
      ) : layout === 'auto' ? (
        <div ref={gridRef}>
          <AutoSizeGrid
            snippets={displaySnippets} onDelete={onDelete} onEdit={onEdit} theme={theme}
            isFavorite={isFavorite} onToggleFavorite={toggleFavorite}
            onFilterLanguage={onFilterLanguage} prefetch={prefetch}
          />
        </div>
      ) : layout === 'spotlight' ? (
        <div ref={gridRef}>
          <SpotlightGrid
            snippets={displaySnippets} onDelete={onDelete} onEdit={onEdit} theme={theme}
            isFavorite={isFavorite} onToggleFavorite={toggleFavorite}
            onFilterLanguage={onFilterLanguage} prefetch={prefetch}
          />
        </div>
      ) : layout === 'masonry' ? (
        <MasonryGrid
          snippets={displaySnippets} onDelete={onDelete} onEdit={onEdit} theme={theme}
          isFavorite={isFavorite} onToggleFavorite={toggleFavorite}
          onFilterLanguage={onFilterLanguage} prefetch={prefetch}
        />
      ) : layout === 'cascade' ? (
        <div ref={gridRef}>
          <CascadeGrid
            snippets={displaySnippets} onDelete={onDelete} onEdit={onEdit} theme={theme}
            isFavorite={isFavorite} onToggleFavorite={toggleFavorite}
            onFilterLanguage={onFilterLanguage} prefetch={prefetch}
          />
        </div>
      ) : (
        <div ref={gridRef} className={LAYOUT_CLASSES[layout as 'stream' | 'grid']}>
          {displaySnippets.map((snippet, index) => (
            <div
              key={snippet.id}
              className={snippetsLoaded ? undefined : 'snippet-stream-item'}
              style={layout === 'stream' ? ({ '--item-index': index } as React.CSSProperties) : undefined}
              onMouseEnter={() => prefetch(snippet.id)}
            >
              <Snippet
                id={snippet.id} title={snippet.title} description={snippet.description}
                content={snippet.content} language={snippet.language}
                onDelete={onDelete} onEdit={onEdit} theme={theme}
                compact={layout !== 'stream'}
                isFavorite={isFavorite(snippet.id)} onToggleFavorite={toggleFavorite}
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
            <GlassPanel
              intensity="medium"
              className="flex min-h-[12rem] items-center justify-center p-8"
            >
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
          onDismiss={() => {
            /* query manages its own error state */
          }}
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
