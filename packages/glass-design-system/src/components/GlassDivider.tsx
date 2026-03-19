import React from 'react';

type Props = {
  /** Extra Tailwind classes — e.g. `my-8` for vertical spacing. */
  className?: string;
};

/**
 * GlassDivider — a 1px horizontal rule that fades to transparent at both ends,
 * matching the glass design system's use of atmosphere over hard lines.
 *
 * Uses the same mid-colour as the global `--color-border` token so it reads
 * as part of the glass surface rather than cutting through it.
 *
 * ```tsx
 * <GlassDivider className="my-10" />
 * ```
 */
const GlassDivider: React.FC<Props> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`h-px w-full bg-gradient-to-r from-transparent via-[oklch(0.48_0.06_248_/_0.30)] to-transparent ${className}`}
  />
);

export default GlassDivider;
