/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Glass Design System                                              │
 * │                                                                   │
 * │  Two master knobs control the entire system:                      │
 * │                                                                   │
 * │  GLASS_OPACITY  0 → 1   background alpha multiplier              │
 * │                 lower = more transparent / more glass-like        │
 * │                                                                   │
 * │  GLASS_BLUR     px      backdrop-filter blur amount               │
 * │                 higher = blurrier / more frosted                  │
 * │                                                                   │
 * │  Each panel picks an intensity ('subtle' | 'medium' | 'strong')  │
 * │  that scales against the master values — so proportional          │
 * │  relationships are preserved when you tune globally.              │
 * └──────────────────────────────────────────────────────────────────┘
 */

export const GLASS_OPACITY = 1.0;
export const GLASS_BLUR    = 28; // px

export type GlassIntensity = 'subtle' | 'medium' | 'strong';

// ── Per-intensity base alphas (scaled by GLASS_OPACITY at runtime) ─

const BASE_BG:      Record<GlassIntensity, number> = { subtle: 0.30, medium: 0.48, strong: 0.88 };
const BASE_BORDER:  Record<GlassIntensity, number> = { subtle: 0.16, medium: 0.26, strong: 0.36 };
const BASE_SHIMMER: Record<GlassIntensity, number> = { subtle: 0.16, medium: 0.26, strong: 0.48 };
const BASE_SHADOW:  Record<GlassIntensity, number> = { subtle: 0.20, medium: 0.34, strong: 0.46 };
const BASE_GLOW:    Record<GlassIntensity, number> = { subtle: 0.10, medium: 0.15, strong: 0.20 };
const GLOW_BLUR:    Record<GlassIntensity, number> = { subtle: 48,   medium: 64,   strong: 56  };

// ── Colour constants ────────────────────────────────────────────────

const BG_L  = '0.20 0.024 254';  // panel background base
const EDGE  = '0.48 0.06 248';   // border edge
const LIGHT = '0.82 0.1  230';   // shimmer / inner highlight
const DEPTH = '0.05 0.015 250';  // shadow depth
const GLOW_TR = '0.72 0.16 240'; // top-right glow (blue)
const GLOW_BL = '0.58 0.14 210'; // bottom-left glow (teal)

// ── Helper ──────────────────────────────────────────────────────────

/** Scale base alpha against the global GLASS_OPACITY master. */
function a(base: number): string {
  return (Math.round(base * GLASS_OPACITY * 1000) / 1000).toFixed(3);
}

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

export function getGlassStyles(intensity: GlassIntensity = 'medium'): GlassStyles {
  const blur      = GLASS_BLUR;
  const glowBlur  = GLOW_BLUR[intensity];

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
