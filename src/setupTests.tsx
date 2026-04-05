// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

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

// IntersectionObserver is not implemented in jsdom. Provide a no-op stub so
// components using it (e.g. Snippet's lazy syntax-highlight) mount without
// throwing. Tests that need to trigger intersection can override this locally
// with vi.spyOn(globalThis, 'IntersectionObserver').
class MockIntersectionObserver {
  observe    = vi.fn();
  unobserve  = vi.fn();
  disconnect = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true, configurable: true, value: MockIntersectionObserver,
});

// masonic uses ResizeObserver for column measurement. Provide a no-op stub.
class MockResizeObserver {
  observe    = vi.fn();
  unobserve  = vi.fn();
  disconnect = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_cb: ResizeObserverCallback) {}
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true, configurable: true, value: MockResizeObserver,
});

// navigator.clipboard is not implemented in jsdom. Provide a stub so tests
// that exercise copy functionality can spy on it.
Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
});

// @uiw/react-codemirror initialises the CodeMirror DOM engine and calls layout
// APIs (getClientRects, measureText) that jsdom does not implement. Replace it
// with a plain <textarea> so form tests can find the code field via its label
// and interact with it normally via userEvent.
vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    id,
    value,
    onChange,
    placeholder,
  }: {
    id?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) =>
    React.createElement('textarea', {
      id,
      value,
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    }),
}));
