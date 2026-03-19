import { capitalize } from './helpers';

test('capitalizes the first letter of a lowercase string', () => {
  expect(capitalize('hello')).toBe('Hello');
});

test('leaves an already-capitalized string unchanged', () => {
  expect(capitalize('World')).toBe('World');
});

test('handles a single character', () => {
  expect(capitalize('a')).toBe('A');
});

test('returns an empty string unchanged', () => {
  expect(capitalize('')).toBe('');
});

test('capitalizes the first letter and leaves the rest as-is', () => {
  expect(capitalize('javaScript')).toBe('JavaScript');
});
