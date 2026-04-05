import React, { act, type ComponentProps } from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ThemeContext } from '../contexts/themeContext';
import themeDefaults from '../contexts/themeContext';
import Snippet from './Snippet';

// gsap.to must invoke onComplete so delete callback fires in tests.
// gsap.fromTo must apply the destination opacity so the dialog card is
// visible — userEvent refuses to click elements with opacity:0.
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_, vars) => { vars?.onComplete?.(); }),
    fromTo: vi.fn((el: Element, _from: unknown, to: Record<string, unknown> = {}) => {
      if (el instanceof HTMLElement && to.opacity != null) {
        (el as HTMLElement).style.opacity = String(to.opacity);
      }
    }),
    timeline: vi.fn(() => ({ to: vi.fn(), fromTo: vi.fn(), call: vi.fn(), kill: vi.fn() })),
  },
}));

type SnippetProps = ComponentProps<typeof Snippet>;

const defaultProps: SnippetProps = {
  id: 1,
  title: 'my snippet',
  content: 'const x = 1;',
  description: 'A test snippet',
  language: 'javascript',
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  theme: 'vs2015',
  isFavorite: false,
};

function renderSnippet(props: Partial<SnippetProps> = {}) {
  return render(
    <MemoryRouter>
      <ThemeContext.Provider value={themeDefaults}>
        <Snippet {...defaultProps} {...props} />
      </ThemeContext.Provider>
    </MemoryRouter>,
  );
}

test('renders title and description', () => {
  renderSnippet();
  expect(screen.getByText('My snippet')).toBeInTheDocument();
  expect(screen.getByText('A test snippet')).toBeInTheDocument();
});

test('renders language badge', () => {
  renderSnippet();
  expect(screen.getByText('JavaScript')).toBeInTheDocument();
});

test('shows "Text" when no language is provided', () => {
  renderSnippet({ language: undefined });
  expect(screen.getByText('Text')).toBeInTheDocument();
});

test('renders delete and edit buttons', () => {
  renderSnippet();
  expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
});

test('calls onDelete with the snippet id when delete is clicked', async () => {
  const onDelete = vi.fn();
  const user = userEvent.setup();
  renderSnippet({ onDelete });
  await user.click(screen.getByRole('button', { name: /delete/i }));
  // Confirm in the dialog that appears
  const dialog = screen.getByRole('alertdialog');
  await user.click(within(dialog).getByRole('button', { name: /delete/i }));
  await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
});

test('calls onEdit with the snippet id when edit is clicked', async () => {
  const onEdit = vi.fn();
  const user = userEvent.setup();
  renderSnippet({ onEdit });
  await user.click(screen.getByRole('button', { name: /edit/i }));
  expect(onEdit).toHaveBeenCalledWith(1);
});

test('shows "Untitled snippet" when title is empty', () => {
  renderSnippet({ title: '' });
  expect(screen.getByText('Untitled snippet')).toBeInTheDocument();
});

test('does not render description when omitted', () => {
  renderSnippet({ description: undefined });
  expect(screen.queryByText('A test snippet')).not.toBeInTheDocument();
});

// ── Scroll cap + fade ────────────────────────────────────────────────────────

test('card container has a max-height cap to prevent overflow', () => {
  renderSnippet();
  // The cap sits on the card container; the scroll wrapper fills it via height:100%.
  expect(screen.getByTestId('snippet-card').style.maxHeight).toBe('650px');
});

test('scroll fade is hidden when content fits within the cap', () => {
  // jsdom reports scrollHeight = clientHeight = 0 — content "fits"
  renderSnippet();
  expect(screen.getByTestId('scroll-fade')).toHaveStyle('opacity: 0');
});

test('scroll fade appears when the code block overflows the cap', () => {
  renderSnippet();
  const wrap = screen.getByTestId('code-scroll-wrap');
  // Simulate a tall code block that exceeds the visible area
  Object.defineProperty(wrap, 'scrollHeight', { configurable: true, value: 1200 });
  Object.defineProperty(wrap, 'clientHeight', { configurable: true, value: 800 });
  Object.defineProperty(wrap, 'scrollTop', { configurable: true, value: 0 });
  fireEvent.scroll(wrap);
  expect(screen.getByTestId('scroll-fade')).toHaveStyle('opacity: 1');
});

test('scroll fade disappears once the user scrolls to the bottom', () => {
  renderSnippet();
  const wrap = screen.getByTestId('code-scroll-wrap');
  Object.defineProperty(wrap, 'scrollHeight', { configurable: true, value: 1200 });
  Object.defineProperty(wrap, 'clientHeight', { configurable: true, value: 800 });
  // First scroll — mid-way through, fade should still be visible
  Object.defineProperty(wrap, 'scrollTop', { configurable: true, value: 200 });
  fireEvent.scroll(wrap);
  expect(screen.getByTestId('scroll-fade')).toHaveStyle('opacity: 1');
  // Second scroll — reach the bottom (scrollHeight - scrollTop === clientHeight)
  Object.defineProperty(wrap, 'scrollTop', { configurable: true, value: 400 });
  fireEvent.scroll(wrap);
  expect(screen.getByTestId('scroll-fade')).toHaveStyle('opacity: 0');
});

// ── Copy ─────────────────────────────────────────────────────────────────────

test('copy button writes the snippet content to the clipboard', async () => {
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  renderSnippet();
  fireEvent.click(screen.getByRole('button', { name: /copy/i }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('const x = 1;'));
});

test('shows a copied toast after clicking copy', async () => {
  vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  const user = userEvent.setup();
  renderSnippet();
  await user.click(screen.getByRole('button', { name: /copy/i }));
  await waitFor(() => {
    expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
  });
});

// ── Favorite ──────────────────────────────────────────────────────────────────

test('calls onToggleFavorite with the snippet id when save is clicked', async () => {
  const onToggleFavorite = vi.fn();
  const user = userEvent.setup();
  renderSnippet({ onToggleFavorite, isFavorite: false });
  await user.click(screen.getByRole('button', { name: /^save$/i }));
  expect(onToggleFavorite).toHaveBeenCalledWith(1);
});

test('shows "Saved" label when isFavorite is true', () => {
  renderSnippet({ onToggleFavorite: vi.fn(), isFavorite: true });
  expect(screen.getByRole('button', { name: /^saved$/i })).toBeInTheDocument();
});

// ── Language filter ────────────────────────────────────────────────────────────

test('calls onFilterLanguage with the language when the chip is clicked', async () => {
  const onFilterLanguage = vi.fn();
  const user = userEvent.setup();
  renderSnippet({ onFilterLanguage });
  // Chip renders as <button> when onClick is provided
  await user.click(screen.getByRole('button', { name: /javascript/i }));
  expect(onFilterLanguage).toHaveBeenCalledWith('javascript');
});

test('card link points to the snippet detail route', () => {
  renderSnippet();
  const links = screen.getAllByRole('link');
  expect(links.some((l) => l.getAttribute('href') === '/snippets/1')).toBe(true);
});

// ── Lazy syntax highlighting ──────────────────────────────────────────────────

test('renders plain <pre> before the card enters the viewport', () => {
  // IntersectionObserver never fires in jsdom (no-op mock in setupTests) so
  // highlighted stays false and the plain <pre> fallback is shown.
  const { container } = renderSnippet();
  expect(container.querySelector('pre')).toBeInTheDocument();
});

test('highlights code immediately when forceAutoSize is true (detail page)', () => {
  // forceAutoSize skips the observer and starts highlighted=true, so
  // SyntaxHighlighter renders directly (mocked to return children as text node,
  // no <pre> wrapper).
  const { container } = renderSnippet({ forceAutoSize: true });
  expect(container.querySelector('pre')).not.toBeInTheDocument();
});

test('switches to highlighted output once IntersectionObserver fires', async () => {
  let intersect!: IntersectionObserverCallback;
  vi.spyOn(globalThis, 'IntersectionObserver').mockImplementation(function(
    cb: IntersectionObserverCallback,
  ) {
    intersect = cb;
    return { observe: vi.fn(), disconnect: vi.fn() } as unknown as IntersectionObserver;
  } as unknown as typeof IntersectionObserver);

  const { container } = renderSnippet();
  expect(container.querySelector('pre')).toBeInTheDocument();

  act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));

  await waitFor(() => {
    expect(container.querySelector('pre')).not.toBeInTheDocument();
  });

  vi.restoreAllMocks();
});
