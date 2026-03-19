/**
 * Background pattern overlays for the Glass Design System.
 *
 * Each pattern is an SVG tile encoded as a `data:image/svg+xml` URL, ready
 * to be used as a CSS `background-image`.  Apply the overlay at low CSS
 * `opacity` (0.10–0.25) with `mix-blend-mode: soft-light` for best results
 * against dark glass backgrounds.
 *
 * ```tsx
 * import { PATTERNS } from 'glass-design-system';
 *
 * const pattern = PATTERNS.find(p => p.id === 'grid')!;
 *
 * <div style={{
 *   backgroundImage: `url("${pattern.url}")`,
 *   backgroundSize: pattern.size,
 *   mixBlendMode: 'soft-light',
 *   opacity: 0.18,
 * }} />
 * ```
 */

const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s.trim())}`;

export interface PatternDef {
  /** Unique identifier. */
  id: string;
  /** Human-readable label. */
  label: string;
  /**
   * Small-scale swatch SVG data URI — suitable for picker buttons (≤ 20 px).
   * The swatch renders at reduced opacity to stay legible in the picker UI.
   */
  swatch: string;
  /**
   * Full-resolution SVG data URI to use as `background-image`.
   * Always paired with `size` for correct tiling.
   */
  url: string;
  /** CSS `background-size` value that produces one clean tile, e.g. `'32px 32px'`. */
  size: string;
}

export const PATTERNS: readonly PatternDef[] = [
  {
    id: 'none',
    label: 'None',
    swatch: 'transparent',
    url: '',
    size: '',
  },
  {
    id: 'grid',
    label: 'Grid',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M 20 0 L 0 0 0 20' fill='none' stroke='white' stroke-width='0.5' opacity='0.6'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><path d='M 32 0 L 0 0 0 32' fill='none' stroke='white' stroke-width='0.6'/></svg>`),
    size: '32px 32px',
  },
  {
    id: 'dots',
    label: 'Dots',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><circle cx='6' cy='6' r='1.5' fill='white' opacity='0.6'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18'><circle cx='9' cy='9' r='1.5' fill='white'/></svg>`),
    size: '18px 18px',
  },
  {
    id: 'crosshatch',
    label: 'Hatch',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M 0 16 L 16 0 M 0 0 L 16 16' stroke='white' stroke-width='0.7' opacity='0.5'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M 0 20 L 20 0 M 0 0 L 20 20' stroke='white' stroke-width='0.7'/></svg>`),
    size: '20px 20px',
  },
  {
    id: 'diagonal',
    label: 'Lines',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M 0 12 L 12 0' stroke='white' stroke-width='0.7' opacity='0.5'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M 0 16 L 16 0' stroke='white' stroke-width='0.7'/></svg>`),
    size: '16px 16px',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M 10 1 L 19 10 10 19 1 10 Z' fill='none' stroke='white' stroke-width='0.7' opacity='0.5'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><path d='M 14 1 L 27 14 14 27 1 14 Z' fill='none' stroke='white' stroke-width='0.6'/></svg>`),
    size: '28px 28px',
  },
  {
    id: 'hex',
    label: 'Hex',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='26' height='22'><polygon points='13,1 24,7 24,15 13,21 2,15 2,7' fill='none' stroke='white' stroke-width='0.7' opacity='0.5'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='34'><polygon points='20,2 37,11 37,23 20,32 3,23 3,11' fill='none' stroke='white' stroke-width='0.6'/></svg>`),
    size: '40px 34px',
  },
  {
    id: 'grid-sm',
    label: 'Fine Grid',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M 16 0 L 0 0 0 16' fill='none' stroke='white' stroke-width='0.4' opacity='0.6'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M 16 0 L 0 0 0 16' fill='none' stroke='white' stroke-width='0.4'/></svg>`),
    size: '16px 16px',
  },
  {
    id: 'dots-sm',
    label: 'Fine Dots',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='0.7' fill='white' opacity='0.6'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='0.7' fill='white'/></svg>`),
    size: '10px 10px',
  },
  {
    id: 'grain',
    label: 'Grain',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='24' height='24' filter='url(#g)'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='256' height='256' filter='url(#g)'/></svg>`),
    size: '256px 256px',
  },
  {
    id: 'noise',
    label: 'Noise',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='24' height='24' filter='url(#n)'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='256' height='256' filter='url(#n)'/></svg>`),
    size: '256px 256px',
  },
  {
    id: 'turbulence',
    label: 'Turbulence',
    swatch: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><filter id='t'><feTurbulence type='turbulence' baseFrequency='0.02' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='24' height='24' filter='url(#t)'/></svg>`),
    url: enc(`<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='t'><feTurbulence type='turbulence' baseFrequency='0.02' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='256' height='256' filter='url(#t)'/></svg>`),
    size: '256px 256px',
  },
];

export type PatternId = (typeof PATTERNS)[number]['id'];
