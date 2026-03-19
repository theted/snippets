import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmDialog from './DeleteConfirmDialog';

// gsap.to fires onComplete immediately.
// gsap.fromTo applies the destination opacity so the card is visible.
// timeline({ onComplete }) calls onComplete immediately so dismiss resolves.
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
        to: vi.fn().mockReturnThis(),
        kill: vi.fn(),
      };
      // Call onComplete after the next microtask so chained .to() calls
      // have already been registered before the timeline "completes".
      if (opts?.onComplete) {
        Promise.resolve().then(opts.onComplete);
      }
      return tl;
    }),
  },
}));

function renderDialog(props: Partial<React.ComponentProps<typeof DeleteConfirmDialog>> = {}) {
  return render(
    <DeleteConfirmDialog
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );
}

// ── Rendering ──────────────────────────────────────────────────────────────────

test('renders the alertdialog with the expected heading', () => {
  renderDialog();
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(screen.getByText(/delete this snippet/i)).toBeInTheDocument();
});

test('renders confirm and cancel buttons', () => {
  renderDialog();
  expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
});

// ── Confirm ────────────────────────────────────────────────────────────────────

test('calls onConfirm when the delete button is clicked', async () => {
  const onConfirm = vi.fn();
  const user = userEvent.setup();
  renderDialog({ onConfirm });
  await user.click(screen.getByRole('button', { name: /delete/i }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

// ── Cancel ─────────────────────────────────────────────────────────────────────

test('calls onCancel when the cancel button is clicked', async () => {
  const onCancel = vi.fn();
  const user = userEvent.setup();
  renderDialog({ onCancel });
  await user.click(screen.getByRole('button', { name: /cancel/i }));
  // onCancel is called via the GSAP timeline's onComplete
  await vi.waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
});

test('calls onCancel when the backdrop scrim is clicked', async () => {
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(<DeleteConfirmDialog onConfirm={vi.fn()} onCancel={onCancel} />);
  // The backdrop is the fixed inset-0 div behind the dialog card (z-40)
  const backdrop = document.querySelector('.fixed.inset-0.z-40') as HTMLElement;
  await user.click(backdrop);
  await vi.waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
});

test('calls onCancel when Escape is pressed', async () => {
  const onCancel = vi.fn();
  const user = userEvent.setup();
  renderDialog({ onCancel });
  await user.keyboard('{Escape}');
  await vi.waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
});

// ── Body class ─────────────────────────────────────────────────────────────────

test('adds dialog-open to document.body while mounted', () => {
  const { unmount } = renderDialog();
  expect(document.body.classList.contains('dialog-open')).toBe(true);
  unmount();
  expect(document.body.classList.contains('dialog-open')).toBe(false);
});
