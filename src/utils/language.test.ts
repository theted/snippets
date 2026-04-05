// @vitest-environment node
import { getLanguageLabel } from './language';

test('maps configured language labels', () => {
  expect(getLanguageLabel('csharp')).toBe('C#');
  expect(getLanguageLabel('sql')).toBe('SQL');
});

test('normalizes casing before resolving language labels', () => {
  expect(getLanguageLabel('JavaScript')).toBe('JavaScript');
});

test('falls back to a readable label for unknown languages', () => {
  expect(getLanguageLabel('objective-c')).toBe('Objective C');
});

test('returns the plaintext label for missing values', () => {
  expect(getLanguageLabel(undefined)).toBe('Text');
});
