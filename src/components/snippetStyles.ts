import type { CSSProperties } from 'react';
import {
  CARD_BG_ALPHA,
  GLOW_BL,
  GLOW_TR,
  getGlassStyles,
  type GlassConfig,
} from 'glass-design-system';

export type SnippetClassSet = {
  container: string;
  glassEdge: string;
  glow: string;
  bottomGlow: string;
  heading: string;
  meta: string;
  titleBlock: string;
  titleLink: string;
  kicker: string;
  title: string;
  description: string;
  code: string;
  controls: string;
  controlButton: string;
  cardMaxHeight: string;
  codeFontSize: string;
  codeLineHeight: string;
};

const fullClasses: SnippetClassSet = {
  container: 'group relative overflow-hidden rounded-[2.2rem] p-5 md:p-8 lg:p-10 cursor-pointer flex flex-col',
  glassEdge: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
  glow: 'pointer-events-none absolute right-[-8rem] top-[-6rem] h-96 w-96 rounded-full',
  bottomGlow: 'pointer-events-none absolute bottom-[-5rem] left-[-5rem] h-80 w-80 rounded-full',
  heading: 'relative z-10 pb-6 flex-none',
  meta: 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between',
  titleBlock: 'max-w-4xl group/link',
  titleLink: 'block outline-none',
  kicker: 'text-[0.68rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel',
  title: 'mt-3 font-[var(--font-display)] text-2xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-3xl lg:text-4xl text-bevel-strong',
  description: 'mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-muted)] text-bevel',
  code: 'relative z-10 overflow-hidden rounded-[1.6rem] text-sm flex-1 min-h-0',
  controls: 'relative z-30 mt-5 flex flex-wrap gap-2 opacity-100 transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 flex-none',
  controlButton: 'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.20em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
  cardMaxHeight: '650px',
  codeFontSize: '0.95rem',
  codeLineHeight: '1.7',
};

const compactClasses: SnippetClassSet = {
  container: 'group relative overflow-hidden rounded-[1.6rem] p-4 md:p-5 cursor-pointer flex flex-col',
  glassEdge: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.1_230_/_0.28)] to-transparent',
  glow: 'pointer-events-none absolute right-[-4rem] top-[-3rem] h-48 w-48 rounded-full',
  bottomGlow: 'pointer-events-none absolute bottom-[-3rem] left-[-3rem] h-48 w-48 rounded-full',
  heading: 'relative z-10 pb-3 flex-none',
  meta: 'flex items-start justify-between gap-3',
  titleBlock: 'min-w-0 group/link',
  titleLink: 'block outline-none',
  kicker: 'text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel',
  title: 'mt-1 font-[var(--font-display)] text-lg font-[300] tracking-[-0.04em] text-[var(--color-text)] md:text-xl text-bevel-strong',
  description: 'mt-1.5 text-xs leading-5 text-[var(--color-text-muted)] line-clamp-2 text-bevel',
  code: 'relative z-10 overflow-hidden rounded-[1.2rem] text-sm flex-1 min-h-0',
  controls: 'relative z-30 mt-3 flex flex-wrap gap-2 opacity-100 transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 flex-none',
  controlButton: 'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] text-bevel transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]',
  cardMaxHeight: '500px',
  codeFontSize: '0.82rem',
  codeLineHeight: '1.6',
};

const baseCodeStyle: CSSProperties = {
  margin: 0,
  padding: '0.5rem 0',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  letterSpacing: '0.012em',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'geometricPrecision',
};

type MousePosition = {
  x: number;
  y: number;
};

type SnippetContainerStyleParams = {
  compact: boolean;
  config: GlassConfig;
  mousePos: MousePosition;
  isHovered: boolean;
  forceAutoSize: boolean;
};

export const getSnippetClasses = (compact: boolean) =>
  compact ? compactClasses : fullClasses;

export const getSnippetCodeStyle = (classes: SnippetClassSet, compact: boolean): CSSProperties => ({
  ...baseCodeStyle,
  borderRadius: compact ? '1.2rem' : '1.8rem',
  fontSize: classes.codeFontSize,
  lineHeight: classes.codeLineHeight,
});

export const getSnippetContainerStyle = ({
  compact,
  config,
  mousePos,
  isHovered,
  forceAutoSize,
}: SnippetContainerStyleParams): CSSProperties => {
  const intensity = compact ? 'medium' : 'strong';
  const glass = getGlassStyles(intensity, config);
  const defaultShadow = glass.panel.boxShadow;
  const hoverShadow = compact
    ? '0 10px 44px oklch(0.05 0.015 250 / 0.42), inset 0 1px 0 oklch(0.8 0.1 230 / 0.18)'
    : '0 12px 52px oklch(0.05 0.015 250 / 0.46), inset 0 1px 0 oklch(0.8 0.1 230 / 0.18)';

  return {
    ...glass.panel,
    backgroundImage: `
      linear-gradient(oklch(0.22 0.028 254 / ${CARD_BG_ALPHA}), oklch(0.22 0.028 254 / ${CARD_BG_ALPHA})),
      radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
        oklch(0.66 0.14 232 / ${isHovered ? '0.08' : '0.06'}),
        oklch(0.34 0.06 245 / ${isHovered ? '0.05' : '0.03'}) 52%,
        oklch(0.26 0.04 250 / 0.01) 100%)
    `,
    backgroundOrigin: 'padding-box, border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: isHovered ? hoverShadow : defaultShadow,
    transition: 'box-shadow 500ms ease',
    maxHeight: forceAutoSize ? undefined : getSnippetClasses(compact).cardMaxHeight,
  };
};

export const getSnippetTopGlowStyle = (compact: boolean): CSSProperties => ({
  background: `radial-gradient(circle, oklch(${GLOW_TR} / 0.14) 0%, transparent 70%)`,
  filter: `blur(${compact ? '48px' : '72px'})`,
});

export const getSnippetBottomGlowStyle = (compact: boolean): CSSProperties => ({
  background: `radial-gradient(circle, oklch(${GLOW_BL} / 0.12) 0%, transparent 70%)`,
  filter: `blur(${compact ? '48px' : '64px'})`,
});

export const getSnippetHoverOverlayStyle = (
  mousePos: MousePosition,
  isHovered: boolean,
): CSSProperties => ({
  background: `radial-gradient(ellipse 120% 100% at ${mousePos.x}% ${mousePos.y}%, oklch(0.86 0.08 228 / 0.015) 0%, transparent 75%)`,
  filter: 'blur(72px)',
  opacity: isHovered ? 1 : 0,
});

export const getSnippetScrollFadeStyle = (showScrollFade: boolean): CSSProperties => ({
  background: 'linear-gradient(to bottom, transparent 55%, oklch(0.11 0.016 255 / 0.38))',
  opacity: showScrollFade ? 1 : 0,
  borderRadius: 'inherit',
});

export const getSnippetFavoriteButtonClassName = (
  controlButtonClassName: string,
  isFavorite: boolean,
) =>
  [
    controlButtonClassName,
    isFavorite ? '!border-[oklch(0.78_0.16_88_/_0.45)] !text-[oklch(0.82_0.18_88)]' : '',
  ]
    .filter(Boolean)
    .join(' ');
