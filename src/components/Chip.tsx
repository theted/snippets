import React from 'react';

export type ChipSize    = 'sm' | 'md';
export type ChipVariant = 'default' | 'accent';

/**
 * Size → padding / text.
 *   sm — compact card contexts (grid / masonry)
 *   md — full-size card contexts (stream) and standalone filter chips
 */
const SIZE: Record<ChipSize, string> = {
  sm: 'px-2.5 py-1 text-[0.60rem] tracking-[0.20em]',
  md: 'px-4 py-2 text-[0.68rem] tracking-[0.24em]',
};

/**
 * Variant → colour.
 *   default — muted glass surface (language badges inside cards)
 *   accent  — sapphire-tinted glass (active filter chips)
 */
const VARIANT: Record<ChipVariant, string> = {
  default: 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]',
  accent:  'border-[oklch(0.62_0.16_240_/_0.5)] bg-[oklch(0.62_0.16_240_/_0.10)] text-[var(--color-accent-bright)]',
};

/** Classes added when the chip has a click handler. */
const INTERACTIVE = [
  'cursor-pointer transition-colors duration-200',
  'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
].join(' ');

type Props = {
  /** Visual size tier. Default: 'md'. */
  size?: ChipSize;
  /** Colour variant. Default: 'default'. */
  variant?: ChipVariant;
  /**
   * Click handler. When provided, the chip renders as a `<button>` so the
   * entire surface is interactive.
   */
  onClick?: React.MouseEventHandler;
  /**
   * Remove handler. When provided, the chip renders as a `<button>` and
   * appends a × glyph — used for dismissible active-filter chips.
   * Takes precedence over `onClick` if both are supplied.
   */
  onRemove?: () => void;
  /** Tooltip / title attribute. */
  title?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Chip — canonical language badge and tag label for the glass design system.
 *
 * Renders as a `<span>` by default. Becomes a `<button>` when `onClick` or
 * `onRemove` is supplied. The `onRemove` variant appends a × glyph and is
 * intended for dismissible active-filter chips.
 *
 * ```tsx
 * // Static display badge (inside a card)
 * <Chip size="sm">TypeScript</Chip>
 *
 * // Clickable filter trigger
 * <Chip onClick={() => onFilterLanguage(lang)} title="Filter by TypeScript">
 *   TypeScript
 * </Chip>
 *
 * // Dismissible active filter
 * <Chip variant="accent" onRemove={() => setLanguageFilter(null)}>
 *   TypeScript
 * </Chip>
 * ```
 */
const Chip: React.FC<Props> = ({
  size = 'md',
  variant = 'default',
  onClick,
  onRemove,
  title,
  className = '',
  children,
}) => {
  const hasAction = onRemove !== undefined || onClick !== undefined;
  const Tag = hasAction ? 'button' : 'span';
  const handler = onRemove ?? onClick;

  return (
    <Tag
      type={hasAction ? 'button' : undefined}
      onClick={handler as React.MouseEventHandler | undefined}
      title={title}
      className={[
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold uppercase text-bevel',
        SIZE[size],
        VARIANT[variant],
        hasAction ? INTERACTIVE : '',
        className,
      ].join(' ')}
    >
      {children}
      {onRemove !== undefined && (
        <span aria-hidden="true" className="opacity-60">×</span>
      )}
    </Tag>
  );
};

export default Chip;
