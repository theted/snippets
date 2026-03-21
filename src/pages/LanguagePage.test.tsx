import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeContext } from '../contexts/themeContext';
import themeDefaults from '../contexts/themeContext';
import LanguagePage from './LanguagePage';
import { _resetSnippetsLoaded } from './Snippets';
import * as api from '../utils/api.ts';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_, vars) => { vars?.onComplete?.(); }),
    fromTo: vi.fn(),
    timeline: vi.fn(() => ({ fromTo: vi.fn(), to: vi.fn(), call: vi.fn(), kill: vi.fn() })),
  },
}));

vi.mock('../utils/api.ts', () => ({
  get: vi.fn(),
  post: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../utils/utils', () => ({
  useDebounce: <T,>(value: T) => value,
}));

const mockSnippets = [
  { id: 1, title: 'JS snippet', content: 'const x = 1;', language: 'javascript' },
  { id: 2, title: 'Also JS', content: 'const y = 2;', language: 'javascript' },
];

function renderLanguagePage(language = 'javascript') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[`/language/${language}`]}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={themeDefaults}>
          <Routes>
            <Route path="/language/:language" element={<LanguagePage />} />
            <Route path="/" element={<div data-testid="home-stub">home</div>} />
          </Routes>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockResolvedValue(mockSnippets);
});

afterEach(() => {
  vi.clearAllMocks();
  _resetSnippetsLoaded();
  document.title = 'Snippets';
});

// ── Heading & title ────────────────────────────────────────────────────────────

test('shows the language display name in the page heading', () => {
  renderLanguagePage('javascript');
  expect(screen.getByRole('heading', { name: /javascript/i })).toBeInTheDocument();
});

test('shows the correct display name for mapped languages', () => {
  renderLanguagePage('python');
  expect(screen.getByRole('heading', { name: /python/i })).toBeInTheDocument();
});

test('updates document.title to include the language name', () => {
  renderLanguagePage('javascript');
  expect(document.title).toBe('Javascript — Snippets');
});

test('restores document.title to "Snippets" on unmount', () => {
  const { unmount } = renderLanguagePage('javascript');
  expect(document.title).toBe('Javascript — Snippets');
  unmount();
  expect(document.title).toBe('Snippets');
});

// ── Navigation ─────────────────────────────────────────────────────────────────

test('renders "All snippets" link back to home', () => {
  renderLanguagePage('javascript');
  expect(screen.getByRole('link', { name: /all snippets/i })).toBeInTheDocument();
});

test('dismissing the language filter chip navigates to home', async () => {
  const user = userEvent.setup();
  renderLanguagePage('javascript');

  // Wait for snippets to load so the filter chip is visible
  await waitFor(() => expect(screen.getByText(/filtered by/i)).toBeInTheDocument());

  // The filter chip is a <button> whose accessible name is the language display name.
  // (The × glyph is aria-hidden.) Find it inside the "Filtered by" region.
  const filterRegion = screen.getByText(/filtered by/i).parentElement!;
  const removeButton = within(filterRegion).getByRole('button', { name: /javascript/i });
  await user.click(removeButton);

  await waitFor(() => {
    expect(screen.getByTestId('home-stub')).toBeInTheDocument();
  });
});
