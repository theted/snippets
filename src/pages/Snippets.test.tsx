import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeContext } from '../contexts/themeContext';
import themeDefaults from '../contexts/themeContext';
import Snippets from './Snippets';
import * as api from '../utils/api.ts';

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

vi.mock('../utils/api.ts', () => ({
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

test('shows only the matching snippet after a search', async () => {
  const user = userEvent.setup();
  renderSnippets();

  await waitFor(() => expect(screen.getByText('Second snippet')).toBeInTheDocument());

  vi.mocked(api.get).mockResolvedValue([mockSnippets[0]]);
  await user.type(screen.getByPlaceholderText(/search snippets/i), 'first');

  await waitFor(() => {
    expect(screen.queryByText('Second snippet')).not.toBeInTheDocument();
    // 'First snippet' appears in both the inline result list and the full card stream
    expect(screen.getAllByText('First snippet').length).toBeGreaterThan(0);
  });
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
