import React from 'react';

type Props = React.PropsWithChildren<{
  /**
   * Extra Tailwind classes — use to override tracking, font size, colour, or
   * margin when the default doesn't fit the context.
   *
   * Default appearance: text-[0.72rem] tracking-[0.32em] text-subtle text-bevel
   */
  className?: string;
}>;

/**
 * Kicker — the canonical small uppercase label used above titles and as
 * section headings throughout the design system.
 *
 * Already includes `text-bevel`, `font-semibold`, `uppercase`, and the
 * standard `tracking-[0.32em]`. Pass `className` to adjust spacing or size.
 *
 * ```tsx
 * <Kicker>Your collection</Kicker>
 * <Kicker className="tracking-[0.42em] text-[0.65rem]">Reference</Kicker>
 * ```
 */
const Kicker: React.FC<Props> = ({ children, className = '' }) => (
  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel ${className}`}>
    {children}
  </p>
);

export default Kicker;
