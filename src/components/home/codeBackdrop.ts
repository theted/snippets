import type { Snippet } from '../../types';

const MAX_LINES_PER_SNIPPET = 14;
const MAX_LINE_LENGTH = 60;

const toBlock = (content: string) => {
  const lines = content
    .replace(/\t/g, '  ')
    .split('\n')
    .map((line) => line.trimEnd().slice(0, MAX_LINE_LENGTH));

  const firstLine = lines.findIndex((line) => line.length > 0);
  return firstLine === -1 ? [] : lines.slice(firstLine, firstLine + MAX_LINES_PER_SNIPPET);
};

const shortestColumn = (columns: string[][]) => columns.reduce(
  (shortest, column) => (column.length < shortest.length ? column : shortest),
);

/**
 * Lays real archive code out as columns for the home hero backdrop: the first
 * lines of each snippet, separated by a blank line, always added to the
 * shortest column so the columns stay even.
 */
export const buildCodeColumns = (
  snippets: Pick<Snippet, 'content'>[],
  columnCount: number,
  linesPerColumn: number,
): string[][] => {
  const columns: string[][] = Array.from({ length: columnCount }, () => []);

  snippets.forEach(({ content }) => {
    const column = shortestColumn(columns);
    if (column.length >= linesPerColumn) return;

    const block = toBlock(content);
    if (block.length > 0) column.push(...block, '');
  });

  return columns.map((column) => column.slice(0, linesPerColumn));
};
