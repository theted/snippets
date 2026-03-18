import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ThemeContext } from '../contexts/themeContext';
import themeDefaults from '../contexts/themeContext';
import Snippet from './Snippet';

// gsap.to must invoke onComplete so delete callback fires in tests
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_, vars) => { vars?.onComplete?.(); }),
    fromTo: vi.fn(),
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
  expect(onDelete).toHaveBeenCalledWith(1);
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
