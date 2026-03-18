import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import Textfield from './Textfield';

type Props = {
  onSearch: (value: string) => void;
}

export type SearchbarHandle = { focus: () => void };

const baseBoxShadow = '0 8px 40px oklch(0.05 0.015 250 / 0.42), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)';
const hoverBoxShadow = '0 0 0 1px oklch(0.65 0.15 240 / 0.14), 0 14px 52px oklch(0.05 0.015 250 / 0.56), inset 0 1px 0 oklch(0.88 0.12 228 / 0.26)';
const focusBoxShadow = '0 0 0 1px oklch(0.68 0.18 240 / 0.38), 0 20px 72px oklch(0.05 0.015 250 / 0.64), inset 0 1px 0 oklch(0.92 0.14 226 / 0.36)';

const titleTextShadow = '0 1px 0 oklch(0.98 0.006 255 / 0.26), 0 0 48px oklch(0.72 0.18 244 / 0.12)';

const Searchbar = forwardRef<SearchbarHandle, Props>(({ onSearch }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const searchCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className="searchbar-hero group relative overflow-hidden rounded-[2.4rem] border backdrop-blur-2xl px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12"
      style={{
        background: `
          radial-gradient(ellipse at 28% 0%, oklch(0.58 0.18 245 / ${isFocused ? '0.42' : '0.24'}) 0%, transparent 52%),
          radial-gradient(ellipse at 90% 95%, oklch(0.36 0.1 255 / ${isFocused ? '0.28' : '0.16'}) 0%, transparent 44%),
          var(--color-glass-card)
        `,
        borderColor: isFocused ? 'oklch(0.62 0.16 240 / 0.72)' : 'var(--color-border)',
        boxShadow: isFocused ? focusBoxShadow : isHovered ? hoverBoxShadow : baseBoxShadow,
        transition: 'box-shadow 500ms ease, border-color 400ms ease, background 500ms ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top-edge glass shimmer — brightens on focus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${isFocused ? 'oklch(0.92 0.16 224 / 0.9)' : 'oklch(0.88 0.12 228 / 0.48)'}, transparent)`,
        }}
      />

      {/* Dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, oklch(0.82 0.06 236 / 0.9) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: isFocused ? 0.07 : 0.048,
          transition: 'opacity 500ms ease',
        }}
      />

      {/* Focus flood — large central brightening glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at 50% 110%, oklch(0.58 0.18 240 / 0.28) 0%, transparent 62%)',
          opacity: isFocused ? 1 : 0,
        }}
      />

      {/* Mouse-tracking reflective highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, oklch(0.88 0.1 228 / 0.1) 0%, transparent 55%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)]">
            Curate The Archive
          </p>
          <h2
            className="mt-3 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.055em] text-[var(--color-text)] md:text-6xl"
            style={{ textShadow: titleTextShadow }}
          >
            Find the exact fragment you need.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-[var(--color-text-muted)] md:text-base">
          Search across titles, descriptions, and code content.
          The shell stays dark and generous so the snippets themselves keep the attention.
        </p>
      </div>
      <div className="relative z-10 mt-8">
        <Textfield
          ref={inputRef}
          name="searchString"
          onChange={searchCallback}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search snippets by title, description, or code"
          className="text-lg md:text-xl"
        />
      </div>
      <p className="relative z-10 mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
        {searchTerm ? `Filtering: ${searchTerm}` : 'Showing every saved snippet'}
      </p>
    </div>
  );
});

export default Searchbar;
