import { buildCodeColumns } from './codeBackdrop';

const snippet = (...lines: string[]) => ({ content: lines.join('\n') });

test('deals snippets into the shortest column, separated by a blank line', () => {
  const columns = buildCodeColumns(
    [snippet('a1', 'a2', 'a3'), snippet('b1'), snippet('c1')],
    2,
    10,
  );

  expect(columns).toEqual([
    ['a1', 'a2', 'a3', ''],
    ['b1', '', 'c1', ''],
  ]);
});

test('skips leading blank lines and empty snippets, and expands tabs', () => {
  const columns = buildCodeColumns([snippet('', '  ', '\tindented'), snippet('', '')], 1, 10);

  expect(columns).toEqual([['  indented', '']]);
});

test('caps lines per snippet, line length and column height', () => {
  const long = 'x'.repeat(100);
  const many = Array.from({ length: 30 }, (_, index) => `line ${index}`);
  const [column] = buildCodeColumns([snippet(long), snippet(...many)], 1, 12);

  expect(column[0]).toHaveLength(60);
  expect(column).toHaveLength(12);
  expect(column.at(-1)).toBe('line 9');
});
