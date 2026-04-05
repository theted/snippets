// @vitest-environment node
import { formatByteSize, formatCountLabel, formatDecimal, formatNumber } from './formatters';

test('formats whole numbers with locale separators', () => {
  expect(formatNumber(12_345)).toBe('12,345');
});

test('formats decimal numbers with fixed precision when requested', () => {
  expect(formatDecimal(0.375, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe(
    '0.38',
  );
});

test('formats byte counts below one kilobyte', () => {
  expect(formatByteSize(999)).toBe('999 B');
});

test('formats kilobytes with a single decimal when needed', () => {
  expect(formatByteSize(1_536)).toBe('1.5 KB');
});

test('formats megabytes correctly', () => {
  expect(formatByteSize(1_572_864)).toBe('1.5 MB');
});

test('pluralizes count labels', () => {
  expect(formatCountLabel(1, 'snippet')).toBe('1 snippet');
  expect(formatCountLabel(2, 'snippet')).toBe('2 snippets');
});
