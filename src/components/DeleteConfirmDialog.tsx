import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { gsap } from 'gsap';
import Icon from './Icon';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmDialog: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Entry animation ──────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.add('dialog-open');
    const tl = gsap.timeline();

    if (backdropRef.current) {
      gsap.to(backdropRef.current, {
        background: 'oklch(0.08 0.012 258 / 0.60)',
        backdropFilter: 'blur(10px)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.86, y: 24, filter: 'blur(6px)' },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.52,
          ease: 'power4.out',
        },
      );
    }

    return () => {
      tl.kill();
      document.body.classList.remove('dialog-open');
    };
  }, []);

  const dismiss = () => {
    const out = gsap.timeline({ onComplete: onCancel });
    if (cardRef.current) {
      out.to(cardRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 14,
        filter: 'blur(4px)',
        duration: 0.3,
        ease: 'power3.in',
      });
    }
    if (backdropRef.current) {
      out.to(
        backdropRef.current,
        {
          background: 'oklch(0.08 0.012 258 / 0)',
          backdropFilter: 'blur(0px)',
          duration: 0.3,
          ease: 'power2.in',
        },
        '<',
      );
    }
  };

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return ReactDOM.createPortal(
    <>
      {/* Scrim */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40"
        style={{ background: 'oklch(0.08 0.012 258 / 0)', backdropFilter: 'blur(0px)' }}
        onClick={dismiss}
      />

      {/* Dialog card */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        onClick={dismiss}
      >
        <div
          ref={cardRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[var(--color-danger)] bg-[oklch(0.16_0.022_258_/_0.98)] p-8 shadow-[0_0_0_1px_oklch(0.65_0.19_25_/_0.18),0_32px_80px_oklch(0.05_0.01_258_/_0.7)]"
          style={{ opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Danger glow in top-right corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, oklch(0.65 0.19 25 / 0.28) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          {/* Top-edge accent line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, oklch(0.65 0.19 25 / 0.7), transparent)',
            }}
          />

          {/* Icon */}
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-danger)] bg-[oklch(0.65_0.19_25_/_0.12)]">
            <Icon name="trash" style={{ color: 'var(--color-danger)', fontSize: '1rem' }} />
          </div>

          {/* Copy */}
          <p
            id="delete-dialog-title"
            className="font-[var(--font-display)] text-2xl font-[250] tracking-[-0.04em] text-[var(--color-text)] [text-shadow:0_1px_0_oklch(1_0_0_/_0.12),0_2px_10px_oklch(0_0_0_/_0.3)]"
          >
            Delete this snippet?
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
            This action cannot be undone. The snippet will be permanently removed from the archive.
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-danger)] px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white text-bevel transition duration-300 hover:-translate-y-0.5 hover:bg-[oklch(0.7_0.19_25)] focus:outline-none focus:ring-4 focus:ring-[oklch(0.65_0.19_25_/_0.3)]"
            >
              <Icon name="trash" style={{ fontSize: '0.9em' }} />
              Delete
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-transparent px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-soft)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default DeleteConfirmDialog;
