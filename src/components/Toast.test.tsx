import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

// gsap.to fires onComplete synchronously so animateDismiss resolves immediately.
// timeline needs a `call` method (used for auto-dismiss scheduling).
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_, vars) => { vars?.onComplete?.(); }),
    fromTo: vi.fn(),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
  },
}));

// ── Aria roles ─────────────────────────────────────────────────────────────────

test('uses role="status" for the success variant', () => {
  render(<Toast message="Saved" onDismiss={vi.fn()} variant="success" />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});

test('uses role="alert" for the error variant', () => {
  render(<Toast message="Error" onDismiss={vi.fn()} variant="error" />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

// ── Message rendering ──────────────────────────────────────────────────────────

test('renders the message text', () => {
  render(<Toast message="Snippet saved!" onDismiss={vi.fn()} />);
  expect(screen.getByText('Snippet saved!')).toBeInTheDocument();
});

// ── Dismiss button visibility ──────────────────────────────────────────────────

test('does not render a dismiss button for the success variant', () => {
  render(<Toast message="OK" onDismiss={vi.fn()} variant="success" />);
  expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
});

test('renders a dismiss button for the error variant', () => {
  render(<Toast message="Fail" onDismiss={vi.fn()} variant="error" />);
  expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
});

// ── Dismiss interaction ────────────────────────────────────────────────────────

test('clicking the dismiss button calls onDismiss', async () => {
  const onDismiss = vi.fn();
  const user = userEvent.setup();
  render(<Toast message="Fail" onDismiss={onDismiss} variant="error" />);
  await user.click(screen.getByRole('button', { name: /dismiss/i }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

// ── Default variant ────────────────────────────────────────────────────────────

test('defaults to the success variant when no variant prop is given', () => {
  render(<Toast message="Done" onDismiss={vi.fn()} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
});
