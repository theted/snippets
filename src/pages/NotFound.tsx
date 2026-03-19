import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="App">
    <div className="relative z-1 mx-auto flex min-h-screen w-full max-w-[100rem] flex-col items-center justify-center gap-8 px-[clamp(1.25rem,4vw,4rem)] text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel">
        Error 404
      </p>
      <h1 className="font-[var(--font-display)] text-[clamp(6rem,20vw,16rem)] font-[250] leading-none tracking-[-0.06em] text-[var(--color-text)] text-bevel-strong opacity-20">
        404
      </h1>
      <p className="mt-2 max-w-md text-[var(--color-text-muted)]">
        This page doesn't exist — or it may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
      >
        <i className="icon-home" style={{ fontSize: '0.85em' }} />
        Back to archive
      </Link>
    </div>
  </div>
);

export default NotFound;
