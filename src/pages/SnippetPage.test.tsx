import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeContext } from '../contexts/themeContext';
import themeDefaults from '../contexts/themeContext';
import SnippetPage from './SnippetPage';
import * as api from '../utils/api';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_, vars) => { vars?.onComplete?.(); }),
    fromTo: vi.fn((el: HTMLElement, _from: unknown, to: Record<string, unknown> = {}) => {
      if (el instanceof HTMLElement && to.opacity != null) {
        el.style.opacity = String(to.opacity);
      }
    }),
    timeline: vi.fn((opts?: { onComplete?: () => void }) => {
      const tl = {
        fromTo: vi.fn().mockReturnThis(),
        to: vi.fn().mockReturnThis(),
        call: vi.fn().mockReturnThis(),
        kill: vi.fn(),
      };
      if (opts?.onComplete) Promise.resolve().then(opts.onComplete);
      return tl;
    }),
  },
}));

vi.mock('../utils/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

// invalidateSnippetQueries wraps queryClient.invalidateQueries — stub it out
// so mutations resolve immediately without triggering real cache logic.
vi.mock('../utils/snippetQueryCache', () => ({
  invalidateSnippetQueries: vi.fn().mockResolvedValue(undefined),
}));

const mockSnippet = {
  id: 42,
  title: 'My snippet',
  content: 'const x = 1;',
  description: 'A description',
  language: 'javascript',
};

// Mirror the real app's SnippetPageRoute so key changes on navigation,
// forcing a clean remount (and fresh navigatingRef) for each snippet id.
const SnippetPageRoute = () => {
  const { id } = useParams<{ id: string }>();
  return <SnippetPage key={id} />;
};

function renderPage(id: number | string = 42) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[`/snippets/${id}`]}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={themeDefaults}>
          <Routes>
            <Route path="/snippets/:id" element={<SnippetPageRoute />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.startsWith('snippets/') && !path.includes('?')) {
      return Promise.resolve(mockSnippet);
    }
    // nav-order list
    return Promise.resolve([mockSnippet]);
  });
});

afterEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

// ── Loading & rendering ────────────────────────────────────────────────────────

test('renders the snippet title after fetch', async () => {
  renderPage();
  await waitFor(() => {
    expect(screen.getByText('My snippet')).toBeInTheDocument();
  });
});

test('renders back-to-archive button', async () => {
  renderPage();
  expect(screen.getByRole('button', { name: /back to archive/i })).toBeInTheDocument();
});

test('renders prev and next navigation buttons', async () => {
  renderPage();
  expect(screen.getByRole('button', { name: /older/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /newer/i })).toBeInTheDocument();
});

test('shows error toast when the fetch fails', async () => {
  vi.mocked(api.get).mockRejectedValue(new Error('Not found'));
  renderPage();
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load snippet/i);
  });
});

// ── Edit flow ─────────────────────────────────────────────────────────────────

test('opens the edit modal when edit is clicked', async () => {
  const user = userEvent.setup();
  renderPage();
  await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: /edit/i }));
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /edit snippet/i })).toBeInTheDocument();
  });
});

test('calls update with the correct data on form submission', async () => {
  vi.mocked(api.update).mockResolvedValue({ ...mockSnippet, title: 'Updated' });
  const user = userEvent.setup();
  renderPage();
  await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());

  await user.click(screen.getByRole('button', { name: /edit/i }));
  await waitFor(() => expect(screen.getByPlaceholderText('Title')).toBeInTheDocument());

  const titleInput = screen.getByPlaceholderText('Title');
  await user.clear(titleInput);
  await user.type(titleInput, 'Updated');
  await user.click(screen.getByRole('button', { name: /^update$/i }));

  await waitFor(() => {
    expect(api.update).toHaveBeenCalledWith(
      'snippets/42',
      expect.objectContaining({ title: 'Updated' }),
    );
  });
});

// ── Delete flow ───────────────────────────────────────────────────────────────

test('calls remove with the correct id when delete is confirmed', async () => {
  vi.mocked(api.remove).mockResolvedValue(undefined);
  const user = userEvent.setup();
  renderPage();
  await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());

  await user.click(screen.getByRole('button', { name: /delete/i }));
  const dialog = screen.getByRole('alertdialog');
  await user.click(
    dialog.querySelector('button[class*="danger"], button') as HTMLElement,
  );

  await waitFor(() => {
    expect(api.remove).toHaveBeenCalledWith('snippets', 42);
  });
});

// ── Keyboard navigation ───────────────────────────────────────────────────────

test('Escape key navigates back to home', async () => {
  const user = userEvent.setup();
  renderPage();
  await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());
  await user.keyboard('{Escape}');
  await waitFor(() => {
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

test('navigateBack plays a GSAP exit animation before calling navigate', async () => {
  const { gsap } = await import('gsap');
  const user = userEvent.setup();
  renderPage();
  await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());

  await user.click(screen.getByRole('button', { name: /back to archive/i }));

  // The exit tween must have been fired with opacity:0 (the visual out-transition)
  expect(gsap.to).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ opacity: 0 }),
  );
  // And navigation must have happened via the onComplete callback
  await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
});

// ── Arrow-key navigation ──────────────────────────────────────────────────────
// Set up a three-snippet nav-order so prevId and nextId are non-null.

describe('Arrow-key navigation', () => {
  const prevSnippet = { id: 41, title: 'Prev snippet', content: 'prev', description: '', language: 'javascript' };
  const nextSnippet = { id: 43, title: 'Next snippet', content: 'next', description: '', language: 'javascript' };

  beforeEach(() => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path === 'snippets/41') return Promise.resolve(prevSnippet);
      if (path === 'snippets/42') return Promise.resolve(mockSnippet);
      if (path === 'snippets/43') return Promise.resolve(nextSnippet);
      // nav-order list — all three snippets, ascending
      return Promise.resolve([prevSnippet, mockSnippet, nextSnippet]);
    });
  });

  test('ArrowRight navigates to the next snippet', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());
    // Wait for nav-order to load so nextId is populated
    await waitFor(() => expect(screen.getByRole('button', { name: /newer/i })).not.toBeDisabled());

    await user.keyboard('{ArrowRight}');

    await waitFor(() => expect(screen.getByText('Next snippet')).toBeInTheDocument());
  });

  test('ArrowLeft navigates to the previous snippet', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: /older/i })).not.toBeDisabled());

    await user.keyboard('{ArrowLeft}');

    await waitFor(() => expect(screen.getByText('Prev snippet')).toBeInTheDocument());
  });

  test('arrow keys do not navigate while a text input is focused', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('My snippet')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: /newer/i })).not.toBeDisabled());

    // Open the edit modal so a text input receives focus
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Title')).toBeInTheDocument());
    await user.click(screen.getByPlaceholderText('Title'));

    await user.keyboard('{ArrowRight}');

    // Still on snippet 42 — the navigation was suppressed
    expect(screen.queryByText('Next snippet')).not.toBeInTheDocument();
    expect(screen.getByText('My snippet')).toBeInTheDocument();
  });
});
