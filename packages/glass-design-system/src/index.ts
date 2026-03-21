// Context / provider
export { GlassProvider, useGlass, GLASS_DEFAULTS } from './context/GlassContext';
export type { GlassConfig } from './context/GlassContext';

// Core config
export {
  getGlassStyles,
  GLASS_OPACITY,
  GLASS_BLUR,
  GLASS_LIGHT_ALPHA,
  GLASS_SHADOW_ALPHA,
  CARD_BG_ALPHA,
  GLOW_TR,
  GLOW_BL,
} from './glass';
export type { GlassIntensity, GlassStyles } from './glass';

// Patterns
export { PATTERNS } from './patterns';
export type { PatternDef, PatternId } from './patterns';

// Backgrounds
export { BG_PRESETS, makeHueGradient } from './backgrounds';
export type { BgPreset, BgId } from './backgrounds';

// Components
export { default as GlassPanel } from './components/GlassPanel';
export { default as GlassPill } from './components/GlassPill';
export type { GlassPillSize, GlassPillVariant } from './components/GlassPill';
export { default as GlassDivider } from './components/GlassDivider';
export {
  default as GlassInput,
  GlassInputWrap,
  GlassTextarea,
} from './components/GlassInput';
export type { GlassInputVariant } from './components/GlassInput';
