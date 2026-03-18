import React from 'react';
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
    timeline: vi.fn(() => ({ to: vi.fn(), kill: vi.fn() })),
  },
}));

const defaultProps = {
  id: 1,
  title: 'my snippet',
  content: 'const x = 1;',
  description: 'A test snippet',
  language: 'javascript',
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  theme: 'vs2015',
};

function renderSnippet(props: Partial<typeof defaultProps> = {}) {
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
  expect(screen.getByText('javascript')).toBeInTheDocument();
});

test('shows "plaintext" when no language is provided', () => {
  renderSnippet({ language: undefined });
  expect(screen.getByText('plaintext')).toBeInTheDocument();
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

test('code scroll wrapper has an 800px max-height cap', () => {
  renderSnippet();
  expect(screen.getByTestId('code-scroll-wrap')).toHaveStyle('max-height: min(800px, 90vh)');
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
