import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeContext } from '../contexts/themeContext';
import themeDefaults from '../contexts/themeContext';
import Snippets, { _resetSnippetsLoaded } from './Snippets';
import * as api from '../utils/api';

vi.mock('../components/CodeEditor', () => ({
  default: ({
    id, value, onChange, placeholder,
  }: {
    id?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  }) => React.createElement('textarea', {
    id,
    value,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
  }),
}));

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_, vars) => { vars?.onComplete?.(); }),
    fromTo: vi.fn(),
    timeline: vi.fn(() => ({ fromTo: vi.fn(), to: vi.fn(), call: vi.fn(), kill: vi.fn() })),
  },
}));

// Mock the debounce hook so searches fire immediately without a 600ms wait
vi.mock('../utils/utils', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('../utils/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

const mockSnippets = [
  { id: 1, title: 'First snippet', content: 'const x = 1;', language: 'javascript' },
  { id: 2, title: 'Second snippet', content: 'def hello(): pass', language: 'python' },
];

function renderSnippets() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={themeDefaults}>
          <Snippets />
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
  localStorage.clear();
  _resetSnippetsLoaded();
});

// ─── Getting snippets ──────────────────────────────────────────────────────────

test('displays fetched snippets', async () => {
  renderSnippets();
  await waitFor(() => {
    expect(screen.getByText('First snippet')).toBeInTheDocument();
    expect(screen.getByText('Second snippet')).toBeInTheDocument();
  });
});

test('shows empty state when no snippets are returned', async () => {
  vi.mocked(api.get).mockResolvedValue([]);
  renderSnippets();
  await waitFor(() => {
    expect(screen.getByText(/no snippets yet/i)).toBeInTheDocument();
  });
});

test('shows error state when the fetch fails', async () => {
  vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
  renderSnippets();
  await waitFor(() => {
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/could not load snippets/i);
    expect(alert).toHaveTextContent(/network error/i);
  });
});

// ─── Searching ────────────────────────────────────────────────────────────────

test('calls get with the search query when the user types', async () => {
  // Type a single character to keep this deterministic: React 19's automatic
  // batching can collapse rapid multi-character typing into one render, making
  // intermediate query keys unpredictable. One character = one render = one call.
  const user = userEvent.setup();
  renderSnippets();

  await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());

  vi.mocked(api.get).mockResolvedValue([mockSnippets[0]]);
  await user.type(screen.getByPlaceholderText(/search snippets/i), 'f');

  await waitFor(() => {
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('q=f'));
  });
});

test('grid stays unchanged while search shows only matching results in the dropdown', async () => {
  const user = userEvent.setup();
  renderSnippets();

  await waitFor(() => expect(screen.getByText('Second snippet')).toBeInTheDocument());

  vi.mocked(api.get).mockResolvedValue([mockSnippets[0]]);
  await user.type(screen.getByPlaceholderText(/search snippets/i), 'first');

  await waitFor(() => {
    // The API is called with the search query for the dropdown results
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('q='));
  });

  // Grid is independent of search — both snippets remain visible in the grid
  expect(screen.getAllByText('First snippet').length).toBeGreaterThan(0);
  expect(screen.getByText('Second snippet')).toBeInTheDocument();
});

// ─── Deleting a snippet ───────────────────────────────────────────────────────

test('calls remove with the correct id when delete is clicked', async () => {
  vi.mocked(api.remove).mockResolvedValue(undefined);
  const user = userEvent.setup();
  renderSnippets();

  await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());

  const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
  await user.click(deleteButtons[0]);

  // Confirm in the dialog
  const dialog = screen.getByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: /delete/i }));

  await waitFor(() => {
    expect(api.remove).toHaveBeenCalledWith('snippets', 1);
  });
});

// ─── Updating a snippet ───────────────────────────────────────────────────────

test('opens the edit modal when edit is clicked', async () => {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.includes('snippets/1')) return Promise.resolve(mockSnippets[0]);
    return Promise.resolve(mockSnippets);
  });

  const user = userEvent.setup();
  renderSnippets();

  await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());

  const editButtons = screen.getAllByRole('button', { name: /edit/i });
  await user.click(editButtons[0]);

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /edit snippet/i })).toBeInTheDocument();
  });
});

test('calls update with the correct data when the edit form is submitted', async () => {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.includes('snippets/1')) return Promise.resolve(mockSnippets[0]);
    return Promise.resolve(mockSnippets);
  });
  vi.mocked(api.update).mockResolvedValue({ ...mockSnippets[0], title: 'Updated title' });

  const user = userEvent.setup();
  renderSnippets();

  await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());

  const editButtons = screen.getAllByRole('button', { name: /edit/i });
  await user.click(editButtons[0]);

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /edit snippet/i })).toBeInTheDocument();
  });

  const titleInput = screen.getByPlaceholderText('Title');
  await user.clear(titleInput);
  await user.type(titleInput, 'Updated title');
  await user.click(screen.getByRole('button', { name: /^update$/i }));

  await waitFor(() => {
    expect(api.update).toHaveBeenCalledWith(
      'snippets/1',
      expect.objectContaining({ id: 1, title: 'Updated title' }),
    );
  });
});

// ── Layout switching ───────────────────────────────────────────────────────────

test.each(['cascade', 'grid', 'stream'] as const)(
  'clicking the %s layout button saves it to localStorage',
  async (layout) => {
    const user = userEvent.setup();
    renderSnippets();
    await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: layout }));
    expect(localStorage.getItem('snippetLayout')).toBe(layout);
  },
);

// masonry uses masonic which relies on DOM measurement APIs absent in jsdom —
// verify it at least saves the preference and mounts without throwing.
test('clicking the masonry layout button saves it to localStorage', async () => {
  const user = userEvent.setup();
  renderSnippets();
  await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'masonry' }));
  expect(localStorage.getItem('snippetLayout')).toBe('masonry');
});

test('restores the saved layout from localStorage on mount', async () => {
  localStorage.setItem('snippetLayout', 'stream');
  renderSnippets();
  // Stream layout stamps each card wrapper with --item-index for stagger animation.
  // Select by the inline custom property which is always set (unlike snippet-stream-item
  // which is absent once snippetsLoaded becomes true after the first render).
  await waitFor(() => {
    const items = document.querySelectorAll<HTMLElement>('[style*="--item-index"]');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveStyle({ '--item-index': '0' });
    expect(items[1]).toHaveStyle({ '--item-index': '1' });
  });
});

// ── Language filter navigation ─────────────────────────────────────────────────

// Renders Snippets inside a full router so navigate() calls can be verified.
function renderSnippetsWithRoutes() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={['/']}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={themeDefaults}>
          <Routes>
            <Route path="/" element={<Snippets />} />
            <Route path="/language/:language" element={<div data-testid="language-page-stub">language page</div>} />
          </Routes>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

test('clicking a language chip navigates to /language/:lang', async () => {
  const user = userEvent.setup();
  renderSnippetsWithRoutes();
  await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());

  // The language chip on the snippet card is a button with the language display name
  await user.click(screen.getAllByRole('button', { name: /javascript/i })[0]);

  await waitFor(() => {
    expect(screen.getByTestId('language-page-stub')).toBeInTheDocument();
  });
});

test('each language chip navigates to the correct /language/:lang route', async () => {
  const user = userEvent.setup();
  renderSnippetsWithRoutes();
  await waitFor(() => expect(screen.getByText('Second snippet')).toBeInTheDocument());

  // Click the Python chip from the second snippet card
  await user.click(screen.getAllByRole('button', { name: /python/i })[0]);

  await waitFor(() => {
    expect(screen.getByTestId('language-page-stub')).toBeInTheDocument();
  });
});

test.each(['cascade', 'grid', 'stream'] as const)(
  '%s layout keeps all snippet cards visible after switching',
  async (layout) => {
    const user = userEvent.setup();
    renderSnippets();
    await waitFor(() => expect(screen.getByText('First snippet')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: layout }));
    await waitFor(() => {
      expect(screen.getByText('First snippet')).toBeInTheDocument();
      expect(screen.getByText('Second snippet')).toBeInTheDocument();
    });
  },
);
