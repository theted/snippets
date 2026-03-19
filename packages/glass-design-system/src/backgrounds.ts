/**
 * Background gradient presets for the Glass Design System.
 *
 * Each preset is a multi-layer CSS gradient string — typically three radial
 * orbs that bloom and blend into each other, a bottom ellipse wash, and a
 * dark linear base.  Apply directly as `background` on a container element.
 *
 * ```tsx
 * import { BG_PRESETS } from 'glass-design-system';
 *
 * const preset = BG_PRESETS.find(p => p.id === 'aurora')!;
 *
 * <div style={{ background: preset.gradient }} />
 * ```
 */

export interface BgPreset {
  /** Unique identifier. */
  id: string;
  /** Human-readable label. */
  label: string;
  /**
   * Simple two-stop gradient for small picker swatches.
   * Use as a CSS `background` value on a ≤ 24 px element.
   */
  swatch: string;
  /**
   * Full multi-layer CSS gradient string.
   * Use as the `background` (or `background-image`) of a full-bleed container.
   */
  gradient: string;
}

export const BG_PRESETS: readonly BgPreset[] = [
  // ── Original dark presets ────────────────────────────────────────────────
  {
    id: 'night',
    label: 'Night',
    swatch: 'linear-gradient(135deg, oklch(0.20 0.06 240), oklch(0.12 0.04 260))',
    gradient: `
      radial-gradient(circle at 14% 18%, oklch(0.42 0.24 216 / 0.26), transparent 26%),
      radial-gradient(circle at 88% 10%, oklch(0.50 0.28 206 / 0.28), transparent 24%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.11 0.08 248 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.12 0.030 246) 0%, oklch(0.07 0.05 250) 100%)
    `,
  },
  {
    id: 'ember',
    label: 'Ember',
    swatch: 'linear-gradient(135deg, oklch(0.22 0.08 28), oklch(0.10 0.04 15))',
    gradient: `
      radial-gradient(circle at 18% 15%, oklch(0.48 0.22 38 / 0.30), transparent 32%),
      radial-gradient(circle at 82% 72%, oklch(0.40 0.20 18 / 0.28), transparent 36%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.10 0.06 22 / 0.92), transparent 100%),
      linear-gradient(180deg, oklch(0.11 0.028 28) 0%, oklch(0.06 0.016 18) 100%)
    `,
  },
  {
    id: 'forest',
    label: 'Forest',
    swatch: 'linear-gradient(135deg, oklch(0.20 0.07 155), oklch(0.09 0.03 165))',
    gradient: `
      radial-gradient(circle at 25% 35%, oklch(0.44 0.20 155 / 0.28), transparent 34%),
      radial-gradient(circle at 78% 15%, oklch(0.38 0.16 175 / 0.24), transparent 30%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.09 0.06 160 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.11 0.032 152) 0%, oklch(0.06 0.018 162) 100%)
    `,
  },
  {
    id: 'dusk',
    label: 'Dusk',
    swatch: 'linear-gradient(135deg, oklch(0.22 0.09 290), oklch(0.10 0.04 310))',
    gradient: `
      radial-gradient(circle at 65% 8%, oklch(0.52 0.24 292 / 0.30), transparent 34%),
      radial-gradient(circle at 12% 75%, oklch(0.42 0.20 322 / 0.26), transparent 36%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.10 0.07 300 / 0.92), transparent 100%),
      linear-gradient(180deg, oklch(0.11 0.030 285) 0%, oklch(0.07 0.022 305) 100%)
    `,
  },
  {
    id: 'dawn',
    label: 'Dawn',
    swatch: 'linear-gradient(135deg, oklch(0.94 0.04 80), oklch(0.82 0.06 45))',
    gradient: `
      radial-gradient(circle at 22% 20%, oklch(0.90 0.08 72 / 0.40), transparent 38%),
      radial-gradient(circle at 80% 60%, oklch(0.78 0.10 42 / 0.28), transparent 40%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.72 0.06 50 / 0.50), transparent 100%),
      linear-gradient(180deg, oklch(0.95 0.014 78) 0%, oklch(0.86 0.022 55) 100%)
    `,
  },

  // ── Multi-colour blends ───────────────────────────────────────────────────
  {
    id: 'aurora',
    label: 'Aurora',
    swatch: 'linear-gradient(135deg, oklch(0.28 0.16 185), oklch(0.16 0.10 320))',
    gradient: `
      radial-gradient(circle at 12% 20%, oklch(0.52 0.22 185 / 0.30), transparent 32%),
      radial-gradient(circle at 85% 15%, oklch(0.48 0.24 320 / 0.26), transparent 36%),
      radial-gradient(circle at 48% 75%, oklch(0.36 0.18 268 / 0.22), transparent 40%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.09 0.07 230 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.09 0.024 215) 0%, oklch(0.05 0.018 240) 100%)
    `,
  },
  {
    id: 'nebula',
    label: 'Nebula',
    swatch: 'linear-gradient(135deg, oklch(0.20 0.10 268), oklch(0.20 0.10 48))',
    gradient: `
      radial-gradient(circle at 78% 12%, oklch(0.58 0.20 52 / 0.28), transparent 30%),
      radial-gradient(circle at 14% 58%, oklch(0.46 0.24 278 / 0.30), transparent 38%),
      radial-gradient(circle at 68% 76%, oklch(0.38 0.18 250 / 0.22), transparent 34%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.09 0.07 268 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.10 0.030 262) 0%, oklch(0.06 0.020 278) 100%)
    `,
  },
  {
    id: 'lagoon',
    label: 'Lagoon',
    swatch: 'linear-gradient(135deg, oklch(0.22 0.09 195), oklch(0.10 0.05 238))',
    gradient: `
      radial-gradient(circle at 20% 18%, oklch(0.56 0.18 192 / 0.28), transparent 30%),
      radial-gradient(circle at 78% 22%, oklch(0.42 0.14 175 / 0.22), transparent 28%),
      radial-gradient(circle at 54% 80%, oklch(0.36 0.20 240 / 0.26), transparent 40%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.08 0.06 212 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.10 0.028 205) 0%, oklch(0.05 0.020 230) 100%)
    `,
  },
  {
    id: 'crimson',
    label: 'Crimson',
    swatch: 'linear-gradient(135deg, oklch(0.22 0.10 18), oklch(0.12 0.06 348))',
    gradient: `
      radial-gradient(circle at 25% 12%, oklch(0.52 0.24 18 / 0.30), transparent 32%),
      radial-gradient(circle at 80% 55%, oklch(0.46 0.20 350 / 0.26), transparent 36%),
      radial-gradient(circle at 15% 76%, oklch(0.38 0.16 330 / 0.20), transparent 30%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.09 0.06 14 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.10 0.028 14) 0%, oklch(0.06 0.018 350) 100%)
    `,
  },
  {
    id: 'solstice',
    label: 'Solstice',
    swatch: 'linear-gradient(135deg, oklch(0.24 0.08 58), oklch(0.14 0.07 188))',
    gradient: `
      radial-gradient(circle at 75% 15%, oklch(0.60 0.20 60 / 0.28), transparent 34%),
      radial-gradient(circle at 18% 65%, oklch(0.50 0.22 190 / 0.28), transparent 38%),
      radial-gradient(circle at 50% 45%, oklch(0.32 0.08 122 / 0.14), transparent 40%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.09 0.04 100 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.10 0.022 80) 0%, oklch(0.06 0.020 195) 100%)
    `,
  },
  {
    id: 'veil',
    label: 'Veil',
    swatch: 'linear-gradient(135deg, oklch(0.22 0.09 295), oklch(0.14 0.07 350))',
    gradient: `
      radial-gradient(circle at 22% 18%, oklch(0.52 0.18 352 / 0.28), transparent 34%),
      radial-gradient(circle at 78% 22%, oklch(0.48 0.20 302 / 0.26), transparent 32%),
      radial-gradient(circle at 45% 72%, oklch(0.38 0.18 270 / 0.24), transparent 38%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.10 0.07 290 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.11 0.030 285) 0%, oklch(0.06 0.024 308) 100%)
    `,
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(135deg, oklch(0.26 0.12 36), oklch(0.14 0.08 292))',
    gradient: `
      radial-gradient(circle at 50% 8%, oklch(0.62 0.22 42 / 0.30), transparent 40%),
      radial-gradient(circle at 15% 52%, oklch(0.44 0.22 295 / 0.26), transparent 36%),
      radial-gradient(circle at 85% 45%, oklch(0.40 0.20 22 / 0.24), transparent 30%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.10 0.07 278 / 0.94), transparent 100%),
      linear-gradient(180deg, oklch(0.11 0.030 30) 0%, oklch(0.06 0.022 285) 100%)
    `,
  },
  {
    id: 'abyss',
    label: 'Abyss',
    swatch: 'linear-gradient(135deg, oklch(0.12 0.04 245), oklch(0.05 0.02 255))',
    gradient: `
      radial-gradient(circle at 30% 20%, oklch(0.34 0.10 238 / 0.22), transparent 36%),
      radial-gradient(circle at 72% 68%, oklch(0.26 0.08 258 / 0.18), transparent 32%),
      radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.07 0.04 248 / 0.96), transparent 100%),
      linear-gradient(180deg, oklch(0.07 0.018 244) 0%, oklch(0.04 0.012 252) 100%)
    `,
  },
];

export type BgId = (typeof BG_PRESETS)[number]['id'];

// ── Custom gradient generator ─────────────────────────────────────────────────

/**
 * Generates a dynamic single-hue gradient matching the preset layering style.
 * @param hue   Perceptual hue angle (0–359).
 * @param orb   Multiplier for orb opacity (0.1–1.5; default 1.0).
 */
export function makeHueGradient(hue: number, orb: number): string {
  const o1 = +(0.28 * orb).toFixed(2);
  const o2 = +(0.24 * orb).toFixed(2);
  const hue2 = (hue + 20) % 360;
  return `
    radial-gradient(circle at 20% 15%, oklch(0.44 0.22 ${hue} / ${o1}), transparent 32%),
    radial-gradient(circle at 80% 70%, oklch(0.38 0.18 ${hue2} / ${o2}), transparent 36%),
    radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.11 0.07 ${hue} / 0.92), transparent 100%),
    linear-gradient(180deg, oklch(0.11 0.030 ${hue}) 0%, oklch(0.06 0.018 ${hue2}) 100%)
  `;
}
