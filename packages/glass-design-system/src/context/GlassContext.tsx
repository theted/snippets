import React, { createContext, useContext, useMemo } from 'react';

export interface GlassConfig {
  /** backdrop-filter blur amount in px. Default: 40 */
  blur: number;
  /** Background alpha multiplier 0–1. Default: 0.66 */
  opacity: number;
  /** Specular wash intensity on hover 0–1. Default: 0.22 */
  lightAlpha: number;
  /** Shadow intensity on the side away from cursor 0–1. Default: 0.20 */
  shadowAlpha: number;
}

export const GLASS_DEFAULTS: GlassConfig = {
  blur: 40,
  opacity: 0.66,
  lightAlpha: 0.22,
  shadowAlpha: 0.20,
};

const GlassContext = createContext<GlassConfig>(GLASS_DEFAULTS);

type ProviderProps = React.PropsWithChildren<Partial<GlassConfig>>;

/**
 * GlassProvider — pass configuration once at the top level; all Glass
 * components beneath it inherit the values. Nest providers to override a
 * subtree (e.g. a pricing section with subtler blur).
 *
 * Unspecified props fall back to the nearest parent provider's values,
 * so you only need to specify what you want to change.
 *
 * ```tsx
 * <GlassProvider blur={40} opacity={0.66}>
 *   <App />
 * </GlassProvider>
 *
 * // Nested override — only this subtree gets tighter blur
 * <GlassProvider blur={24}>
 *   <PricingSection />
 * </GlassProvider>
 * ```
 */
export function GlassProvider({ children, blur, opacity, lightAlpha, shadowAlpha }: ProviderProps) {
  const parent = useContext(GlassContext);

  const value = useMemo<GlassConfig>(
    () => ({
      blur: blur ?? parent.blur,
      opacity: opacity ?? parent.opacity,
      lightAlpha: lightAlpha ?? parent.lightAlpha,
      shadowAlpha: shadowAlpha ?? parent.shadowAlpha,
    }),
    [blur, opacity, lightAlpha, shadowAlpha, parent]
  );

  return <GlassContext.Provider value={value}>{children}</GlassContext.Provider>;
}

/** Read the nearest GlassProvider's configuration. */
export function useGlass(): GlassConfig {
  return useContext(GlassContext);
}
