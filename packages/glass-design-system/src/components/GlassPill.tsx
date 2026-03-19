import React from 'react';

export type GlassPillSize    = 'xs' | 'sm' | 'md' | 'lg';
export type GlassPillVariant = 'default' | 'active' | 'accent';

/**
 * Size → padding / text / gap.
 *   xs  0.60rem — layout toggles, tiny controls
 *   sm  0.68rem — card controls, compact nav
 *   md  0.68rem — standard nav back-links (more padding than sm)
 *   lg  0.72rem — top-level toolbar actions
 */
const SIZE: Record<GlassPillSize, string> = {
  xs: 'gap-1.5 px-3 py-1 text-[0.60rem] tracking-[0.20em]',
  sm: 'gap-2 px-4 py-2 text-[0.68rem] tracking-[0.24em]',
  md: 'gap-2 px-5 py-2.5 text-[0.68rem] tracking-[0.24em]',
  lg: 'gap-2 px-6 py-3.5 text-[0.72rem] tracking-[0.24em]',
};

/**
 * Variant → border / background / text colour.
 *   default — muted glass surface, lifts to surface on hover
 *   active  — already-selected state (surface-strong, no hover shift)
 *   accent  — sapphire-tinted glass for active filters / highlights
 */
const VARIANT: Record<GlassPillVariant, string> = {
  default: [
    'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]',
    'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
  ].join(' '),
  active: 'border-[var(--color-border-strong)] bg-[var(--color-surface-strong)] text-[var(--color-text)]',
  accent: [
    'border-[oklch(0.62_0.16_240_/_0.5)] bg-[oklch(0.62_0.16_240_/_0.10)] text-[var(--color-accent-bright)]',
    'hover:bg-[oklch(0.62_0.16_240_/_0.18)]',
  ].join(' '),
};

/** Invariant classes shared by every pill regardless of size or variant. */
const BASE = [
  'inline-flex items-center rounded-full border font-semibold uppercase',
  'text-bevel backdrop-blur-md',
  'transition duration-300 ease-out',
  'hover:-translate-y-0.5',
  'focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-soft)]',
  'disabled:opacity-30 disabled:pointer-events-none',
].join(' ');

type Props = React.PropsWithChildren<{
  /** Visual size tier. Default: 'md'. */
  size?: GlassPillSize;
  /** Colour/state variant. Default: 'default'. */
  variant?: GlassPillVariant;
  /**
   * Underlying HTML element or component to render.
   * Pass a React Router `Link` for internal navigation, `'a'` for external links.
   * Default: `'button'`.
   */
  as?: React.ElementType;
  className?: string;
  [key: string]: unknown;
}>;

/**
 * GlassPill — the canonical chrome button/link for navigation and UI controls.
 *
 * Handles sizing, glass surface (backdrop-blur + transparent bg), text-bevel,
 * hover lift, and focus rings automatically. Use `as={Link}` for router links.
 *
 * ```tsx
 * <GlassPill size="lg" as={Link} to="/favorites">
 *   <i className="icon-star-empty" /> Favorites
 * </GlassPill>
 *
 * <GlassPill size="xs" variant={isActive ? 'active' : 'default'} onClick={toggle}>
 *   Grid
 * </GlassPill>
 * ```
 */
const GlassPill: React.FC<Props> = ({
  size = 'md',
  variant = 'default',
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) => {
  const typeDefault = Tag === 'button' && !rest.type ? { type: 'button' } : {};

  return (
    <Tag
      className={`${BASE} ${SIZE[size]} ${VARIANT[variant]} ${className}`}
      {...typeDefault}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default GlassPill;
