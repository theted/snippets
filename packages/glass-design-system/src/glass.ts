/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Glass Design System                                              │
 * │                                                                   │
 * │  Master knobs — edit these to retheme every glass surface at once │
 * │                                                                   │
 * │  GLASS_OPACITY      0 → 1   background alpha multiplier          │
 * │                     lower = more transparent / more glass-like   │
 * │                                                                   │
 * │  GLASS_BLUR         px      backdrop-filter blur amount          │
 * │                     higher = blurrier / more frosted             │
 * │                                                                   │
 * │  GLASS_LIGHT_ALPHA  0 → 1   specular wash intensity on hover     │
 * │  GLASS_SHADOW_ALPHA 0 → 1   opposite-side shadow intensity       │
 * │                                                                   │
 * │  Each panel picks an intensity ('subtle' | 'medium' | 'strong') │
 * │  that scales against the master values — proportional            │
 * │  relationships are preserved when you tune globally.             │
 * └──────────────────────────────────────────────────────────────────┘
 */

import type { GlassConfig } from './context/GlassContext';
import { GLASS_DEFAULTS } from './context/GlassContext';

// Re-export defaults as named constants for backwards compatibility
export const GLASS_OPACITY      = GLASS_DEFAULTS.opacity;
export const GLASS_BLUR         = GLASS_DEFAULTS.blur;
export const GLASS_LIGHT_ALPHA  = GLASS_DEFAULTS.lightAlpha;
export const GLASS_SHADOW_ALPHA = GLASS_DEFAULTS.shadowAlpha;

export type GlassIntensity = 'subtle' | 'medium' | 'strong';

// ── Per-intensity base alphas (scaled by config.opacity at runtime) ─

const BASE_BG:      Record<GlassIntensity, number> = { subtle: 0.17, medium: 0.30, strong: 0.64 };
const BASE_BORDER:  Record<GlassIntensity, number> = { subtle: 0.20, medium: 0.32, strong: 0.44 };
const BASE_SHIMMER: Record<GlassIntensity, number> = { subtle: 0.24, medium: 0.38, strong: 0.64 };
const BASE_SHADOW:  Record<GlassIntensity, number> = { subtle: 0.20, medium: 0.34, strong: 0.46 };
const BASE_GLOW:    Record<GlassIntensity, number> = { subtle: 0.07, medium: 0.10, strong: 0.13 };
const GLOW_BLUR:    Record<GlassIntensity, number> = { subtle: 96,   medium: 120,  strong: 108 };

// ── Colour constants ────────────────────────────────────────────────

const BG_L    = '0.20 0.024 254';  // panel background base
const EDGE    = '0.48 0.06 248';   // border edge
const LIGHT   = '0.82 0.1  230';   // shimmer / inner highlight
const DEPTH   = '0.05 0.015 250';  // shadow depth
export const GLOW_TR = '0.52 0.24 238';   // top-right glow (deep blue)
export const GLOW_BL = '0.58 0.14 210';   // bottom-left glow (teal)

// Base alpha for the flat background layer used by Snippet cards
// (they render their own background outside GlassPanel — this keeps
//  them in sync with GLASS_OPACITY so all surfaces scale together).
const CARD_BG_BASE = 0.512; // = 0.42 / 0.82 — preserves original ratio
export const CARD_BG_ALPHA = Math.round(CARD_BG_BASE * GLASS_DEFAULTS.opacity * 1000) / 1000;

// ── Public types ────────────────────────────────────────────────────

export interface GlassStyles {
  /** Apply directly to the panel wrapper element. */
  panel: {
    background:     string;
    backdropFilter: string;
    border:         string;
    boxShadow:      string;
  };
  /** Colour token for the top-edge 1px shimmer line. */
  shimmerColor: string;
  /** Style for the top-right ambient corner glow div. */
  topRightGlow: {
    background: string;
    filter:     string;
  };
  /** Style for the optional bottom-left ambient corner glow div. */
  bottomLeftGlow: {
    background: string;
    filter:     string;
  };
}

// ── Main export ─────────────────────────────────────────────────────

/**
 * Compute glass surface styles for the given intensity tier.
 *
 * When used inside a React component, prefer calling `useGlass()` and
 * passing the result as the second argument so the component inherits
 * configuration from the nearest `<GlassProvider>`.
 *
 * ```tsx
 * const config = useGlass();
 * const glass  = getGlassStyles('medium', config);
 * ```
 */
export function getGlassStyles(
  intensity: GlassIntensity = 'medium',
  config: GlassConfig = GLASS_DEFAULTS,
): GlassStyles {
  const { blur, opacity } = config;
  const glowBlur = GLOW_BLUR[intensity];

  /** Scale base alpha against the provider's opacity master. */
  function a(base: number): string {
    return (Math.round(base * opacity * 1000) / 1000).toFixed(3);
  }

  return {
    panel: {
      background:     `oklch(${BG_L} / ${a(BASE_BG[intensity])})`,
      backdropFilter: `blur(${blur}px)`,
      border:         `1px solid oklch(${EDGE} / ${a(BASE_BORDER[intensity])})`,
      boxShadow: [
        `0 8px 40px oklch(${DEPTH} / ${a(BASE_SHADOW[intensity])})`,
        `inset 0 1px 0 oklch(${LIGHT} / ${a(BASE_SHIMMER[intensity] * 0.55)})`,
      ].join(', '),
    },
    shimmerColor:  `oklch(${LIGHT} / ${a(BASE_SHIMMER[intensity])})`,
    topRightGlow: {
      background: `radial-gradient(circle, oklch(${GLOW_TR} / ${a(BASE_GLOW[intensity])}) 0%, transparent 70%)`,
      filter:     `blur(${glowBlur}px)`,
    },
    bottomLeftGlow: {
      background: `radial-gradient(circle, oklch(${GLOW_BL} / ${a(BASE_GLOW[intensity] * 0.75)}) 0%, transparent 70%)`,
      filter:     `blur(${Math.round(glowBlur * 0.9)}px)`,
    },
  };
}
