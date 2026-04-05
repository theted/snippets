import type { CSSProperties } from 'react';
import {
  DEFAULT_SNIPPET_LAYOUT,
  type SnippetLayout,
} from '../../config';
import { getLanguageLabel } from '../../utils/language';
import { computeCardWidth } from '../../utils/snippetLayout';

export const LAYOUT_OPTIONS: SnippetLayout[] = [
  'auto',
  'spotlight',
  'cascade',
  'grid',
  'masonry',
  'stream',
];

const VALID_LAYOUTS = new Set<SnippetLayout>(LAYOUT_OPTIONS);

export const LAYOUT_CLASSES: Record<'stream' | 'grid', string> = {
  stream: 'mt-12 flex flex-col gap-14 md:mt-16 md:gap-20',
  grid: 'mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mt-16 md:gap-10 xl:grid-cols-3',
};

export const CASCADE_PATTERN = [1, 2, 3, 2];
export const CASCADE_ROW_CLASSES = [
  'grid-cols-1',
  'grid-cols-1 sm:grid-cols-2',
  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
];

export const AUTO_GUTTER = 20;
export const COL_MIN_WIDTH = 260;
export const MIN_COLS = 5;
export const MAX_COLS = 6;
export const AUTO_REFLOW_ANIMATIONS = false;

let snippetsLoaded = false;

export const markSnippetsLoaded = () => {
  snippetsLoaded = true;
};

export const resetSnippetsLoaded = () => {
  snippetsLoaded = false;
};

export const getSnippetRevealProps = (index?: number) => {
  if (snippetsLoaded) {
    return {};
  }

  return {
    className: 'snippet-stream-item',
    style: index === undefined ? undefined : ({ '--item-index': index } as CSSProperties),
  };
};

export const getStoredSnippetLayout = (): SnippetLayout => {
  const savedLayout = window.localStorage.getItem('snippetLayout') as SnippetLayout | null;

  if (savedLayout && VALID_LAYOUTS.has(savedLayout)) {
    return savedLayout;
  }

  if (window.localStorage.getItem('autoSize') === 'true') {
    return 'auto';
  }

  return DEFAULT_SNIPPET_LAYOUT;
};

export const getSnippetEmptyStateMessage = (languageFilter: string | null) => {
  if (!languageFilter) {
    return 'No snippets yet — create one to get started.';
  }

  return `No snippets with language "${getLanguageLabel(languageFilter)}"`;
};

export const groupByCascade = <T,>(items: T[]) => {
  const groups: T[][] = [];
  let index = 0;
  let patternIndex = 0;

  while (index < items.length) {
    const size = CASCADE_PATTERN[patternIndex % CASCADE_PATTERN.length];
    groups.push(items.slice(index, index + size));
    index += size;
    patternIndex += 1;
  }

  return groups;
};

export const getSnippetColumnSpan = (
  content: string,
  colCount: number,
  colWidth: number,
): 1 | 2 | 3 => {
  const naturalWidth = computeCardWidth(content);
  const span = Math.ceil((naturalWidth + AUTO_GUTTER) / (colWidth + AUTO_GUTTER));

  return Math.max(1, Math.min(span, colCount, 3)) as 1 | 2 | 3;
};

export const packVariableWidth = (
  spans: (1 | 2 | 3)[],
  heights: number[],
  colCount: number,
  colWidth: number,
) => {
  const colHeights = new Array<number>(colCount).fill(0);

  return spans.map((rawSpan, index) => {
    const span = Math.min(rawSpan, colCount) as 1 | 2 | 3;
    let bestCol = 0;
    let bestHeight = Number.POSITIVE_INFINITY;

    for (let col = 0; col <= colCount - span; col += 1) {
      let candidateHeight = colHeights[col];

      for (let spanIndex = 1; spanIndex < span; spanIndex += 1) {
        candidateHeight = Math.max(candidateHeight, colHeights[col + spanIndex]);
      }

      if (candidateHeight < bestHeight) {
        bestHeight = candidateHeight;
        bestCol = col;
      }
    }

    const left = bestCol * (colWidth + AUTO_GUTTER);
    const top = bestHeight;
    const width = span * colWidth + (span - 1) * AUTO_GUTTER;
    const nextHeight = top + heights[index] + AUTO_GUTTER;

    for (let col = bestCol; col < bestCol + span; col += 1) {
      colHeights[col] = nextHeight;
    }

    return { left, top, width };
  });
};

export const getAutoColumnCount = (containerWidth: number) => {
  if (containerWidth <= 0) {
    return MIN_COLS;
  }

  return Math.min(
    MAX_COLS,
    Math.max(MIN_COLS, Math.floor((containerWidth + AUTO_GUTTER) / (COL_MIN_WIDTH + AUTO_GUTTER))),
  );
};

export const getAutoColumnWidth = (containerWidth: number, colCount: number) => {
  if (containerWidth <= 0) {
    return COL_MIN_WIDTH;
  }

  return (containerWidth - (colCount - 1) * AUTO_GUTTER) / colCount;
};
