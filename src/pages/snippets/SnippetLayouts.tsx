import {
  createContext,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Masonry } from 'masonic';
import type { SnippetLayout } from '../../config';
import type { Snippet as SnippetRecord, SnippetId } from '../../types';
import SnippetCard from './SnippetCard';
import {
  AUTO_GUTTER,
  AUTO_REFLOW_ANIMATIONS,
  CASCADE_PATTERN,
  CASCADE_ROW_CLASSES,
  LAYOUT_CLASSES,
  getAutoColumnCount,
  getAutoColumnWidth,
  getSnippetColumnSpan,
  getSnippetRevealProps,
  groupByCascade,
  packVariableWidth,
} from './snippetLayoutUtils';

type LayoutCallbacks = {
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  theme: string;
  isFavorite: (id: SnippetId) => boolean;
  onToggleFavorite: (id: SnippetId) => void;
  onFilterLanguage: (language: string) => void;
  prefetch: (id: SnippetId) => void;
};

type SharedLayoutProps = LayoutCallbacks & {
  snippets: SnippetRecord[];
};

type MasonryCardProps = {
  data: SnippetRecord;
  width: number;
  index: number;
};

const MasonryContext = createContext<LayoutCallbacks | null>(null);

const MasonryCard = memo(({ data }: MasonryCardProps) => {
  const callbacks = useContext(MasonryContext);

  if (!callbacks) {
    return null;
  }

  return (
    <SnippetCard
      snippet={data}
      compact
      theme={callbacks.theme}
      isFavorite={callbacks.isFavorite(data.id)}
      onDelete={callbacks.onDelete}
      onEdit={callbacks.onEdit}
      onToggleFavorite={callbacks.onToggleFavorite}
      onFilterLanguage={callbacks.onFilterLanguage}
      prefetch={callbacks.prefetch}
    />
  );
});

const MasonryGrid = ({ snippets, ...callbacks }: SharedLayoutProps) => (
  <MasonryContext.Provider value={callbacks}>
    <div className="mt-12 md:mt-16">
      <Masonry
        items={snippets}
        render={MasonryCard}
        columnGutter={32}
        columnWidth={380}
        overscanBy={2}
        itemKey={(snippet) => snippet.id}
      />
    </div>
  </MasonryContext.Provider>
);

const StandardLayout = ({
  snippets,
  layout,
  ...callbacks
}: SharedLayoutProps & { layout: 'stream' | 'grid' }) => (
  <div className={LAYOUT_CLASSES[layout]}>
    {snippets.map((snippet, index) => {
      const revealProps = getSnippetRevealProps(layout === 'stream' ? index : undefined);

      return (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          compact={layout !== 'stream'}
          theme={callbacks.theme}
          isFavorite={callbacks.isFavorite(snippet.id)}
          onDelete={callbacks.onDelete}
          onEdit={callbacks.onEdit}
          onToggleFavorite={callbacks.onToggleFavorite}
          onFilterLanguage={callbacks.onFilterLanguage}
          prefetch={callbacks.prefetch}
          className={revealProps.className}
          style={revealProps.style}
        />
      );
    })}
  </div>
);

const CascadeGrid = ({ snippets, ...callbacks }: SharedLayoutProps) => {
  const rows = groupByCascade(snippets);
  let absoluteIndex = 0;

  return (
    <div className="mt-12 flex flex-col gap-8 md:mt-16 md:gap-10">
      {rows.map((row, rowIndex) => {
        const patternIndex = rowIndex % CASCADE_PATTERN.length;
        const rowStart = absoluteIndex;
        absoluteIndex += row.length;

        return (
          <div
            key={`${rowIndex}-${row.length}`}
            className={`grid gap-8 md:gap-10 ${CASCADE_ROW_CLASSES[patternIndex]}`}
          >
            {row.map((snippet, columnIndex) => {
              const revealProps = getSnippetRevealProps(rowStart + columnIndex);

              return (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  compact={patternIndex > 0}
                  theme={callbacks.theme}
                  isFavorite={callbacks.isFavorite(snippet.id)}
                  onDelete={callbacks.onDelete}
                  onEdit={callbacks.onEdit}
                  onToggleFavorite={callbacks.onToggleFavorite}
                  onFilterLanguage={callbacks.onFilterLanguage}
                  prefetch={callbacks.prefetch}
                  className={revealProps.className}
                  style={revealProps.style}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const SpotlightGrid = ({ snippets, ...callbacks }: SharedLayoutProps) => {
  const [hero, ...rest] = snippets;

  return (
    <div className="mt-12 md:mt-16">
      {hero && (
        <SnippetCard
          snippet={hero}
          compact={false}
          theme={callbacks.theme}
          isFavorite={callbacks.isFavorite(hero.id)}
          onDelete={callbacks.onDelete}
          onEdit={callbacks.onEdit}
          onToggleFavorite={callbacks.onToggleFavorite}
          onFilterLanguage={callbacks.onFilterLanguage}
          prefetch={callbacks.prefetch}
          {...getSnippetRevealProps(0)}
        />
      )}

      {rest.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 xl:grid-cols-3">
          {rest.map((snippet, index) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              compact
              theme={callbacks.theme}
              isFavorite={callbacks.isFavorite(snippet.id)}
              onDelete={callbacks.onDelete}
              onEdit={callbacks.onEdit}
              onToggleFavorite={callbacks.onToggleFavorite}
              onFilterLanguage={callbacks.onFilterLanguage}
              prefetch={callbacks.prefetch}
              {...getSnippetRevealProps(index + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AutoSizeGrid = ({ snippets, ...callbacks }: SharedLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateWidth = () => setContainerWidth(container.offsetWidth);
    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateHeights = () => {
      const nextHeights = itemRefs.current.map((element) => element?.offsetHeight ?? 0);
      setItemHeights((currentHeights) =>
        currentHeights.length === nextHeights.length &&
        currentHeights.every((height, index) => height === nextHeights[index])
          ? currentHeights
          : nextHeights,
      );
    };

    updateHeights();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeights);
    itemRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [snippets]);

  const colCount = getAutoColumnCount(containerWidth);
  const colWidth = getAutoColumnWidth(containerWidth, colCount);
  const spans = snippets.map((snippet) => getSnippetColumnSpan(snippet.content, colCount, colWidth));
  const isPositioned = itemHeights.length === snippets.length && itemHeights.every((height) => height > 0);
  const positions = isPositioned ? packVariableWidth(spans, itemHeights, colCount, colWidth) : null;
  const totalHeight = positions
    ? Math.max(...positions.map((position, index) => position.top + itemHeights[index]))
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
      {snippets.map((snippet, index) => {
        const position = positions?.[index];
        const span = spans[index];
        const width = position?.width ?? span * colWidth + (span - 1) * AUTO_GUTTER;
        const revealProps = getSnippetRevealProps();

        return (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            compact={span === 1}
            theme={callbacks.theme}
            isFavorite={callbacks.isFavorite(snippet.id)}
            onDelete={callbacks.onDelete}
            onEdit={callbacks.onEdit}
            onToggleFavorite={callbacks.onToggleFavorite}
            onFilterLanguage={callbacks.onFilterLanguage}
            prefetch={callbacks.prefetch}
            wrapperRef={(element) => {
              itemRefs.current[index] = element;
            }}
            className={revealProps.className}
            style={
              {
                ...revealProps.style,
                position: position ? 'absolute' : 'relative',
                left: position?.left ?? 0,
                top: position?.top ?? 0,
                width: `min(${width}px, 100%)`,
                opacity: position ? 1 : 0,
                transition: position
                  ? AUTO_REFLOW_ANIMATIONS
                    ? 'opacity 0.35s ease, top 0.45s cubic-bezier(0.4,0,0.2,1), left 0.45s cubic-bezier(0.4,0,0.2,1)'
                    : 'opacity 0.35s ease'
                  : 'none',
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
};

type Props = SharedLayoutProps & {
  layout: SnippetLayout;
};

const SnippetLayouts = ({ layout, ...props }: Props) => {
  switch (layout) {
    case 'auto':
      return <AutoSizeGrid {...props} />;
    case 'spotlight':
      return <SpotlightGrid {...props} />;
    case 'cascade':
      return <CascadeGrid {...props} />;
    case 'masonry':
      return <MasonryGrid {...props} />;
    case 'stream':
    case 'grid':
      return <StandardLayout {...props} layout={layout} />;
    default:
      return null;
  }
};

export default SnippetLayouts;
