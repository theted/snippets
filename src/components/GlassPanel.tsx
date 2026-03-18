import React from 'react';
import { getGlassStyles, GlassIntensity } from '../design/glass';

export type { GlassIntensity };

type Props = React.PropsWithChildren<{
  /** Controls opacity/blur/shadow depth. Scales against global GLASS_OPACITY + GLASS_BLUR. */
  intensity?: GlassIntensity;
  /** Show top-right ambient corner glow. Default true. */
  topGlow?: boolean;
  /** Show bottom-left ambient counter-glow. Default false. */
  bottomGlow?: boolean;
  /** Border-radius Tailwind class. Default 'rounded-[2.2rem]'. */
  rounded?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Render as a different HTML element (e.g. 'form', 'section'). Default 'div'. */
  as?: React.ElementType;
  [key: string]: unknown;
}>;

const GlassPanel: React.FC<Props> = ({
  intensity = 'medium',
  topGlow = true,
  bottomGlow = false,
  rounded = 'rounded-[2.2rem]',
  className = '',
  style,
  children,
  as: Tag = 'div',
  ...rest
}) => {
  const glass = getGlassStyles(intensity);

  return (
    <Tag
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ ...glass.panel, ...style }}
      {...rest}
    >
      {/* Top-edge 1px shimmer — simulates light catching the glass rim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${glass.shimmerColor}, transparent)`,
        }}
      />

      {/* Top-right ambient glow — wide band so blur washes across the full top edge */}
      {topGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-4rem] top-[-10rem] h-[24rem] w-[44rem] rounded-full"
          style={glass.topRightGlow}
        />
      )}

      {/* Bottom-left counter-glow */}
      {bottomGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-5rem] left-[-5rem] h-72 w-72 rounded-full"
          style={glass.bottomLeftGlow}
        />
      )}

      {children}
    </Tag>
  );
};

export default GlassPanel;
