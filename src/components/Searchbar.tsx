import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Textfield from './Textfield';
import { capitalize } from '../utils/helpers';

type SearchResult = { id: number; title: string; language?: string };

type Props = {
  onSearch: (value: string) => void;
  results?: SearchResult[];
  isLoadingResults?: boolean;
  isSearching?: boolean;
  debouncedQuery?: string;
}

export type SearchbarHandle = { focus: () => void };

const baseBoxShadow = '0 8px 40px oklch(0.05 0.015 250 / 0.42), inset 0 1px 0 oklch(0.8 0.1 230 / 0.14)';
const hoverBoxShadow = '0 0 0 1px oklch(0.65 0.15 240 / 0.14), 0 14px 52px oklch(0.05 0.015 250 / 0.56), inset 0 1px 0 oklch(0.88 0.12 228 / 0.26)';
const focusBoxShadow = '0 0 0 1px oklch(0.68 0.18 240 / 0.38), 0 20px 72px oklch(0.05 0.015 250 / 0.64), inset 0 1px 0 oklch(0.92 0.14 226 / 0.36)';

const titleTextShadow = '0 1px 0 oklch(0.98 0.006 255 / 0.26), 0 0 48px oklch(0.72 0.18 244 / 0.12)';

const Searchbar = forwardRef<SearchbarHandle, Props>(({
  onSearch,
  results = [],
  isLoadingResults = false,
  isSearching = false,
  debouncedQuery = '',
}, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const searchCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    onSearch(value);
  };

  // ── Keyboard navigation ────────────────────────────────────────────────────

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      resultRefs.current[0]?.focus();
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  const handleResultKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < results.length - 1) resultRefs.current[index + 1]?.focus();
      else inputRef.current?.focus(); // wrap back to input at end of list
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) inputRef.current?.focus();
      else resultRefs.current[index - 1]?.focus();
    } else if (e.key === 'Escape') {
      clearSearch();
      inputRef.current?.focus();
    }
  };

  // ── Panel interaction ──────────────────────────────────────────────────────

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Keep panel lit while focus is anywhere inside it (input OR result items)
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  return (
    <div
      className="searchbar-hero group relative overflow-hidden rounded-[2.4rem] backdrop-blur-2xl px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12"
      style={{
        border: '1px solid transparent',
        backgroundImage: `
          radial-gradient(ellipse at 28% 0%, oklch(0.58 0.18 245 / ${isFocused ? '0.32' : '0.16'}) 0%, transparent 52%),
          radial-gradient(ellipse at 90% 95%, oklch(0.36 0.1 255 / ${isFocused ? '0.2' : '0.1'}) 0%, transparent 44%),
          linear-gradient(var(--color-glass-card), var(--color-glass-card)),
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
            oklch(0.72 0.16 232 / ${isFocused ? '0.72' : isHovered ? '0.52' : '0.32'}),
            oklch(0.38 0.07 245 / ${isFocused ? '0.48' : isHovered ? '0.36' : '0.22'}) 52%,
            oklch(0.28 0.04 250 / 0.2) 100%)
        `,
        backgroundOrigin: 'padding-box, padding-box, padding-box, border-box',
        backgroundClip: 'padding-box, padding-box, padding-box, border-box',
        boxShadow: isFocused ? focusBoxShadow : isHovered ? hoverBoxShadow : baseBoxShadow,
        transition: 'box-shadow 500ms ease, background 500ms ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlur={handleBlur}
    >
      {/* SVG noise filter definition — hidden, referenced by grain overlay */}
      <svg aria-hidden="true" className="pointer-events-none absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id="searchbar-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
            <feComposite in="blended" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Grain / sandy texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2.4rem]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          backgroundRepeat: 'repeat',
          opacity: 0.045,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Top-edge glass shimmer */}
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

      {/* Focus flood */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at 50% 110%, oklch(0.58 0.18 240 / 0.28) 0%, transparent 62%)',
          opacity: isFocused ? 1 : 0,
        }}
      />
      {/* Focus lighten — brightens the whole panel when the input is active */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(160deg, oklch(0.92 0.04 240 / 0.07) 0%, oklch(0.88 0.06 238 / 0.05) 100%)',
          opacity: isFocused ? 1 : 0,
        }}
      />

      {/* Mouse-tracking reflective highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, oklch(0.88 0.1 228 / 0.055) 0%, transparent 55%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel">
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
          value={searchTerm}
          onChange={searchCallback}
          onKeyDown={handleInputKeyDown}
          placeholder="Search snippets by title, description, or code"
          className="text-lg md:text-xl"
          autoComplete="off"
        />
      </div>

      {/* ── Inline search results ──────────────────────────────────── */}
      <div className={`relative z-10 search-results-wrap${isSearching ? ' open' : ''}`}>
        <div>
          {isSearching && (
            isLoadingResults ? (
              <p className="search-results-status">Searching…</p>
            ) : results.length === 0 ? (
              <p className="search-results-status">No snippets matched &ldquo;{debouncedQuery}&rdquo;</p>
            ) : (
              <ul className="search-results-list" role="listbox" aria-label="Search results">
                {results.map((snippet, index) => (
                  <li key={snippet.id} className="search-result-item" role="option" aria-selected="false">
                    <Link
                      to={`/snippets/${snippet.id}`}
                      ref={(el) => { resultRefs.current[index] = el; }}
                      className="search-result-link"
                      onKeyDown={(e) => handleResultKeyDown(e, index)}
                      tabIndex={0}
                    >
                      <span className="search-result-title">{capitalize(snippet.title || 'Untitled snippet')}</span>
                      <span className="search-result-lang">{snippet.language || 'plaintext'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>

      <p className="relative z-10 mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
        {isSearching ? `${results.length} result${results.length !== 1 ? 's' : ''} found` : 'Showing every saved snippet'}
      </p>
    </div>
  );
});

export default Searchbar;
