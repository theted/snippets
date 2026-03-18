// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// react-syntax-highlighter pulls in the entire highlight.js bundle (~2 MB of
// language grammars + themes). Replacing it with a lightweight stub cuts the
// test import phase from ~28 s to a few seconds without affecting any
// assertions — no test cares about syntax colouring.
vi.mock('react-syntax-highlighter', () => ({
  // Return children as-is; React 18+ allows string/number returns from components.
  default: ({ children }: { children: string }) => children,
}));

// The styles module has 90+ named theme exports. Vitest v4 validates every
// named access on a mock namespace, so we need to list the themes explicitly.
// Tests always use the default theme (vs2015), so that's all we need here.
vi.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({ vs2015: {} }));
