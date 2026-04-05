import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useGlass } from 'glass-design-system';
import Textfield from './Textfield';
import SearchbarResults from './SearchbarResults';
import {
  getRandomSearchbarTitle,
  searchbarBoxShadows,
  TITLE_TEXT_SHADOW,
  type SearchbarResult,
} from './searchbarContent';

type Props = {
  onSearch: (value: string) => void;
  results?: SearchbarResult[];
  isLoadingResults?: boolean;
  isSearching?: boolean;
  debouncedQuery?: string;
};

export type SearchbarHandle = { focus: () => void };

const Searchbar = forwardRef<SearchbarHandle, Props>(({
  onSearch,
  results = [],
  isLoadingResults = false,
  isSearching = false,
  debouncedQuery = '',
}, ref) => {
  const { blur } = useGlass();
  const [title] = useState(getRandomSearchbarTitle);
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
    resultRefs.current = [];
    setSearchTerm('');
    onSearch('');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      resultRefs.current[0]?.focus();
    } else if (event.key === 'Escape') {
      clearSearch();
    }
  };

  const handleResultKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (index < results.length - 1) {
        resultRefs.current[index + 1]?.focus();
      } else {
        inputRef.current?.focus();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (index === 0) {
        inputRef.current?.focus();
      } else {
        resultRefs.current[index - 1]?.focus();
      }
    } else if (event.key === 'Escape') {
      clearSearch();
      inputRef.current?.focus();
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setMousePos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  return (
    <div
      className="searchbar-hero group relative overflow-hidden rounded-[2.4rem] px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12"
      style={{
        backdropFilter: `blur(${blur}px)`,
        border: '1px solid transparent',
        backgroundImage: `
          linear-gradient(var(--color-glass-card), var(--color-glass-card)),
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
            oklch(0.72 0.16 232 / ${isFocused ? '0.14' : isHovered ? '0.16' : '0.08'}),
            oklch(0.38 0.07 245 / ${isFocused ? '0.08' : isHovered ? '0.10' : '0.05'}) 52%,
            oklch(0.28 0.04 250 / 0.04) 100%)
        `,
        backgroundOrigin: 'padding-box, border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: isFocused
          ? searchbarBoxShadows.focus
          : isHovered
            ? searchbarBoxShadows.hover
            : searchbarBoxShadows.base,
        transition: 'box-shadow 500ms ease, background 500ms ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlur={handleContainerBlur}
    >
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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${isFocused ? 'oklch(0.92 0.16 224 / 0.9)' : 'oklch(0.88 0.12 228 / 0.48)'}, transparent)`,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2.4rem]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
          opacity: isFocused ? 0.06 : 0.04,
          transition: 'opacity 500ms ease',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at 50% 110%, oklch(0.58 0.18 240 / 0.10) 0%, transparent 62%)',
          opacity: isFocused ? 1 : 0,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-2rem] transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.55 0.16 238 / 0.07) 0%, transparent 70%)',
          filter: 'blur(32px)',
          opacity: isFocused ? 1 : 0,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse ${isFocused ? '130% 110%' : '90% 80%'} at ${mousePos.x}% ${mousePos.y}%, oklch(0.88 0.1 228 / ${isFocused ? '0.04' : '0.025'}) 0%, transparent ${isFocused ? '80%' : '70%'})`,
          filter: `blur(${isFocused ? '72px' : '48px'})`,
          opacity: isHovered || isFocused ? 1 : 0,
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel">
            {title.kicker}
          </p>
          <h2
            className="mt-3 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.055em] text-[var(--color-text)] md:text-6xl"
            style={{ textShadow: TITLE_TEXT_SHADOW }}
          >
            {title.headline}
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
          onChange={handleSearchChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Search snippets by title, description, or code"
          className="text-lg md:text-xl"
          autoComplete="off"
        />
      </div>

      <SearchbarResults
        results={results}
        isLoadingResults={isLoadingResults}
        isSearching={isSearching}
        debouncedQuery={debouncedQuery}
        resultRefs={resultRefs}
        onResultKeyDown={handleResultKeyDown}
      />

      <p className="relative z-10 mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
        {isSearching
          ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
          : 'Showing every saved snippet'}
      </p>
    </div>
  );
});

export default Searchbar;
