import React, { useState } from 'react';
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
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <Tag
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ ...glass.panel, ...style }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* Mouse-tracking light — follows cursor, fades in/out on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 70% 55% at ${mousePos.x}% ${mousePos.y}%, oklch(0.82 0.08 228 / 0.06) 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Top-right ambient glow — wide band so blur washes across the full top edge */}
      {topGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-4rem] top-[-12rem] h-[28rem] w-[58rem] rounded-full"
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
