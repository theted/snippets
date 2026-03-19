import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, GLASS_BLUR } from 'glass-design-system';

// ── Layout helpers ────────────────────────────────────────────────────────────

const Section: React.FC<React.PropsWithChildren<{ label: string; sub?: string }>> = ({ label, sub, children }) => (
  <section className="mb-24">
    <div className="mb-8">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-[var(--color-text-subtle)] text-bevel">
        {label}
      </p>
      {sub && <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)] text-bevel">{sub}</p>}
    </div>
    {children}
  </section>
);

const Rule: React.FC = () => (
  <div className="my-6 h-px w-full" style={{ background: 'var(--color-border)' }} />
);

const Mono: React.FC<React.PropsWithChildren> = ({ children }) => (
  <code
    className="text-[0.62rem] text-[var(--color-accent-bright)]"
    style={{ fontFamily: 'var(--font-code)' }}
  >
    {children}
  </code>
);

// ── Hue data ──────────────────────────────────────────────────────────────────

const HUE_STEPS = [
  { hue: 0,   label: 'Red',     L: 0.58, C: 0.22 },
  { hue: 30,  label: 'Amber',   L: 0.72, C: 0.20 },
  { hue: 60,  label: 'Yellow',  L: 0.80, C: 0.18 },
  { hue: 90,  label: 'Lime',    L: 0.70, C: 0.20 },
  { hue: 130, label: 'Green',   L: 0.68, C: 0.22 },
  { hue: 165, label: 'Teal',    L: 0.68, C: 0.20 },
  { hue: 200, label: 'Cyan',    L: 0.72, C: 0.18 },
  { hue: 225, label: 'Sky',     L: 0.70, C: 0.20 },
  { hue: 244, label: 'Blue',    L: 0.66, C: 0.22 },
  { hue: 272, label: 'Indigo',  L: 0.60, C: 0.22 },
  { hue: 295, label: 'Violet',  L: 0.60, C: 0.24 },
  { hue: 325, label: 'Rose',    L: 0.62, C: 0.22 },
] as const;

// Background stage definitions for "glass on color" section
const COLOR_STAGES = [
  {
    label: 'Ocean',
    bg: `radial-gradient(circle at 30% 40%, oklch(0.38 0.22 225 / 0.95), oklch(0.18 0.08 240) 70%)`,
    accent: 'oklch(0.72 0.18 215)',
  },
  {
    label: 'Ember',
    bg: `radial-gradient(circle at 70% 30%, oklch(0.62 0.24 38 / 0.95), oklch(0.20 0.08 20) 70%)`,
    accent: 'oklch(0.80 0.18 55)',
  },
  {
    label: 'Forest',
    bg: `radial-gradient(circle at 25% 60%, oklch(0.42 0.22 148 / 0.95), oklch(0.16 0.06 162) 70%)`,
    accent: 'oklch(0.76 0.18 145)',
  },
  {
    label: 'Dusk',
    bg: `radial-gradient(circle at 60% 25%, oklch(0.46 0.26 292 / 0.95), oklch(0.16 0.08 308) 70%)`,
    accent: 'oklch(0.74 0.20 285)',
  },
  {
    label: 'Rose',
    bg: `radial-gradient(circle at 40% 55%, oklch(0.52 0.24 10 / 0.95), oklch(0.18 0.08 350) 70%)`,
    accent: 'oklch(0.78 0.18 5)',
  },
  {
    label: 'Glacier',
    bg: `radial-gradient(circle at 55% 35%, oklch(0.52 0.14 200 / 0.90), oklch(0.28 0.06 220) 60%), linear-gradient(160deg, oklch(0.68 0.10 195 / 0.60), oklch(0.20 0.04 230) 100%)`,
    accent: 'oklch(0.85 0.08 195)',
  },
] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

/** Single hue chip: colored background + glass panel floating on it */
const HueChip: React.FC<{
  hue: number; label: string; L: number; C: number; size?: 'sm' | 'lg';
}> = ({ hue, label, L, C, size = 'sm' }) => {
  const vivid = `oklch(${L} ${C} ${hue})`;
  const deep  = `oklch(${Math.max(0.08, L - 0.42)} ${Math.max(0.04, C - 0.12)} ${hue})`;
  const tint  = `oklch(${L} ${Math.min(C * 0.55, 0.14)} ${hue} / 0.14)`;
  const border = `oklch(${L} ${Math.min(C * 0.7, 0.18)} ${hue} / 0.45)`;

  return (
    <div
      className={`relative overflow-hidden ${size === 'lg' ? 'rounded-[2rem] p-5' : 'rounded-[1.6rem] p-3'}`}
      style={{
        background: `radial-gradient(circle at 35% 30%, ${vivid} 0%, ${deep} 65%)`,
      }}
    >
      {/* Glass panel sitting on the colored background */}
      <div
        className={`relative overflow-hidden ${size === 'lg' ? 'rounded-[1.4rem] p-4' : 'rounded-[1rem] p-3'}`}
        style={{
          background: tint,
          backdropFilter: `blur(${GLASS_BLUR}px)`,
          border: `1px solid ${border}`,
          boxShadow: `0 4px 24px ${deep.replace(')', ' / 0.40)')}`,
        }}
      >
        {/* Shimmer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${vivid.replace(')', ' / 0.50)')}, transparent)`,
          }}
        />
        <p
          className="relative z-10 font-[var(--font-display)] font-[300] tracking-[-0.03em] text-bevel-strong"
          style={{
            fontSize: size === 'lg' ? '1.5rem' : '1.05rem',
            color: 'oklch(0.97 0.006 255)',
          }}
        >
          {label}
        </p>
        <p className="relative z-10 mt-1 font-[var(--font-code)] text-[0.58rem]" style={{ color: `${vivid.replace(')', ' / 0.80)')}` }}>
          {hue}°
        </p>
      </div>
      {/* Corner glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-24 w-24 rounded-full"
        style={{ background: `radial-gradient(circle, ${vivid.replace(')', ' / 0.30)')} 0%, transparent 70%)`, filter: 'blur(24px)' }}
      />
    </div>
  );
};

/** Shows glass at one intensity level over a colored background */
const GlassOnColor: React.FC<{
  bg: string; label: string; accent: string;
}> = ({ bg, label, accent }) => (
  <div className="relative overflow-hidden rounded-[2rem]" style={{ background: bg }}>
    {/* Ambient noise */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.70' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)' opacity='0.040'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />

    <div className="relative z-10 p-5">
      {/* Stage label */}
      <p
        className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.30em] text-bevel"
        style={{ color: accent }}
      >
        {label}
      </p>

      {/* Three glass panels at each intensity */}
      <div className="grid grid-cols-3 gap-3">
        {(['subtle', 'medium', 'strong'] as const).map((intensity) => {
          const alphas = { subtle: 0.14, medium: 0.28, strong: 0.50 };
          const tint = `oklch(0.20 0.025 254 / ${alphas[intensity]})`;
          const borderAlpha = { subtle: 0.22, medium: 0.36, strong: 0.52 };
          return (
            <div
              key={intensity}
              className="relative overflow-hidden rounded-[1.2rem] p-4"
              style={{
                background: tint,
                backdropFilter: `blur(${GLASS_BLUR}px)`,
                border: `1px solid oklch(0.7 0.05 250 / ${borderAlpha[intensity]})`,
                boxShadow: `0 4px 20px oklch(0.04 0.01 255 / 0.32), inset 0 1px 0 oklch(0.9 0.04 230 / ${borderAlpha[intensity] * 0.55})`,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / ${borderAlpha[intensity] * 0.80}), transparent)` }}
              />
              <p className="relative z-10 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-bevel" style={{ color: 'oklch(0.82 0.025 255)' }}>
                {intensity}
              </p>
              <p className="relative z-10 mt-1.5 font-[var(--font-display)] text-lg font-[300] tracking-[-0.03em] text-bevel-strong" style={{ color: 'oklch(0.97 0.006 255)' }}>
                Glass
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/** Swatch strip for chroma / lightness scale */
const ScaleStrip: React.FC<{
  steps: { color: string; label: string; sub: string; dim?: boolean }[];
}> = ({ steps }) => (
  <div className="flex flex-col gap-3">
    {steps.map(({ color, label, sub, dim }) => (
      <div key={label} className="flex items-center gap-4">
        {/* Color block */}
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.9rem]"
          style={{ background: color, border: '1px solid oklch(1 0 0 / 0.10)' }}
        >
          {/* Glass micro-panel on top */}
          <div
            className="absolute inset-1 rounded-[0.6rem]"
            style={{
              backdropFilter: `blur(${GLASS_BLUR / 2}px)`,
              background: 'oklch(0.90 0.02 255 / 0.10)',
              border: '1px solid oklch(1 0 0 / 0.15)',
            }}
          />
        </div>
        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="font-[var(--font-display)] text-base font-[300] tracking-[-0.02em] text-bevel" style={{ color: dim ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
            {label}
          </p>
          <Mono>{sub}</Mono>
        </div>
        {/* Swatch bar */}
        <div
          className="h-3 w-28 shrink-0 rounded-full"
          style={{ background: color, border: '1px solid oklch(1 0 0 / 0.10)' }}
        />
      </div>
    ))}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const ColorShowcase: React.FC = () => {
  const [activeHue, setActiveHue] = useState(244);
  const activeStep = HUE_STEPS.find((h) => h.hue === activeHue) ?? HUE_STEPS[8];

  // Chroma steps for selected hue
  const chromaSteps = [0.00, 0.06, 0.12, 0.18, 0.24].map((C) => ({
    color: `oklch(0.48 ${C.toFixed(2)} ${activeHue})`,
    label: C === 0 ? 'Achromatic' : C < 0.10 ? 'Faint' : C < 0.16 ? 'Soft' : C < 0.22 ? 'Vivid' : 'Maximum',
    sub: `oklch(0.48 ${C.toFixed(2)} ${activeHue})`,
    dim: C === 0,
  }));

  // Lightness steps for selected hue
  const lightnessSteps = [0.10, 0.26, 0.45, 0.65, 0.84].map((L) => {
    const C = L > 0.78 ? Math.max(0.04, activeStep.C - 0.10) : activeStep.C;
    return {
      color: `oklch(${L} ${C.toFixed(2)} ${activeHue})`,
      label: L < 0.20 ? 'Near black' : L < 0.35 ? 'Dark' : L < 0.55 ? 'Mid' : L < 0.75 ? 'Bright' : 'Near white',
      sub: `oklch(${L} ${C.toFixed(2)} ${activeHue})`,
    };
  });

  return (
    <div className="relative min-h-screen">
      <div
        className="mx-auto px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,6vw,5rem)]"
        style={{ maxWidth: '132rem' }}
      >

        {/* Back nav */}
        <Link
          to="/"
          className="mb-14 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] transition duration-200 hover:text-[var(--color-text-muted)]"
        >
          ← Back
        </Link>

        {/* Hero */}
        <div className="mb-24">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-[var(--color-text-subtle)]">
            Design system
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-[clamp(3.5rem,10vw,7rem)] font-[200] leading-[0.9] tracking-[-0.07em] text-[var(--color-text)] text-bevel-strong">
            Colour &amp; Glass
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
            How the frosted-glass material interacts with colour. Every section places
            glass panels directly on saturated backgrounds so you can observe how{' '}
            <code className="font-[var(--font-code)] text-[0.85em] text-[var(--color-accent-bright)]">
              backdrop-filter: blur()
            </code>{' '}
            samples, averages, and transforms the colour beneath it.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            § 00 — Hue spectrum
        ══════════════════════════════════════════════════════════════ */}
        <Section
          label="00 — Hue spectrum"
          sub="Twelve hues across the OKLCh wheel — each panel is glass sitting on its own saturated gradient."
        >
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
            {HUE_STEPS.map(({ hue, label, L, C }) => (
              <HueChip key={hue} hue={hue} label={label} L={L} C={C} size="sm" />
            ))}
          </div>

          {/* Wide version of one hue for detail */}
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {HUE_STEPS.slice(0, 6).map(({ hue, label, L, C }) => (
              <HueChip key={hue} hue={hue} label={label} L={L} C={C} size="lg" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {HUE_STEPS.slice(6).map(({ hue, label, L, C }) => (
              <HueChip key={hue} hue={hue} label={label} L={L} C={C} size="lg" />
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════
            § 01 — Glass on colour
        ══════════════════════════════════════════════════════════════ */}
        <Section
          label="01 — Glass on colour"
          sub="Six coloured environments. Each shows subtle, medium, and strong glass panels sitting directly on the background — the blur samples the gradient beneath."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {COLOR_STAGES.map((stage) => (
              <GlassOnColor key={stage.label} bg={stage.bg} label={stage.label} accent={stage.accent} />
            ))}
          </div>

          {/* Wide immersive demo — one full-width stage */}
          <div
            className="relative mt-8 overflow-hidden rounded-[2.4rem] p-8 md:p-12"
            style={{
              background: `
                radial-gradient(circle at 15% 55%, oklch(0.46 0.26 225 / 0.85), transparent 42%),
                radial-gradient(circle at 85% 20%, oklch(0.52 0.28 280 / 0.80), transparent 38%),
                radial-gradient(circle at 55% 90%, oklch(0.38 0.20 165 / 0.70), transparent 36%),
                linear-gradient(160deg, oklch(0.14 0.04 240), oklch(0.10 0.03 268))
              `,
            }}
          >
            {/* Grain overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)' opacity='0.038'/%3E%3C/svg%3E")`,
                backgroundSize: '180px 180px',
                opacity: 0.6,
              }}
            />
            <p className="relative z-10 mb-8 text-[0.68rem] font-semibold uppercase tracking-[0.36em] text-bevel" style={{ color: 'oklch(0.75 0.14 225)' }}>
              Tricolour mix · Blue + Violet + Teal
            </p>
            <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <GlassPanel intensity="subtle" topGlow rounded="rounded-[1.8rem]" className="p-6">
                <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Subtle</p>
                <p className="mt-3 font-[var(--font-display)] text-2xl font-[250] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
                  Airy glass
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
                  Background bleeds strongly through — the blur mixes all three colour zones.
                </p>
              </GlassPanel>
              <GlassPanel intensity="medium" topGlow bottomGlow rounded="rounded-[1.8rem]" className="p-6">
                <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Medium</p>
                <p className="mt-3 font-[var(--font-display)] text-2xl font-[250] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
                  Balanced glass
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
                  Enough body to stay readable while the background tints the panel colour.
                </p>
              </GlassPanel>
              <GlassPanel intensity="strong" topGlow rounded="rounded-[1.8rem]" className="p-6">
                <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Strong</p>
                <p className="mt-3 font-[var(--font-display)] text-2xl font-[250] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
                  Dense glass
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
                  Higher opacity suppresses the background; only a hint of the colours filters through.
                </p>
              </GlassPanel>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════
            § 02 — Chroma & lightness explorer
        ══════════════════════════════════════════════════════════════ */}
        <Section
          label="02 — Chroma &amp; lightness"
          sub="Pick a hue and explore its full chroma (saturation) and lightness scale. A micro glass panel sits on each swatch."
        >
          {/* Hue picker */}
          <div className="mb-8 flex flex-wrap gap-2">
            {HUE_STEPS.map(({ hue, label, L, C }) => (
              <button
                key={hue}
                type="button"
                onClick={() => setActiveHue(hue)}
                className="relative overflow-hidden rounded-full px-4 py-2 text-[0.60rem] font-semibold uppercase tracking-[0.20em] transition duration-200"
                style={{
                  background: activeHue === hue
                    ? `oklch(${L} ${C} ${hue} / 0.28)`
                    : 'oklch(0.22 0.026 254 / 0.45)',
                  border: activeHue === hue
                    ? `1px solid oklch(${L} ${C} ${hue} / 0.55)`
                    : '1px solid oklch(0.4 0.044 248 / 0.32)',
                  color: activeHue === hue
                    ? `oklch(${Math.min(L + 0.18, 0.95)} ${Math.min(C, 0.14)} ${hue})`
                    : 'var(--color-text-subtle)',
                }}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ background: `oklch(${L} ${C} ${hue})`, verticalAlign: 'middle' }}
                />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Chroma scale */}
            <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8">
              <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
                Chroma (saturation)
              </p>
              <p className="mb-6 text-xs text-[var(--color-text-muted)] text-bevel">
                Same hue and lightness — only C changes. Higher C = more vivid.
              </p>
              <ScaleStrip steps={chromaSteps} />
              <Rule />
              <p className="text-xs leading-6 text-[var(--color-text-muted)] text-bevel">
                OKLCh chroma has no fixed upper bound — it depends on the hue.
                Blues support higher C than greens before clipping to sRGB.
                The glass blur on each swatch shows how the tint intensity tracks with C.
              </p>
            </GlassPanel>

            {/* Lightness scale */}
            <GlassPanel intensity="medium" topGlow bottomGlow rounded="rounded-[2rem]" className="p-8">
              <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
                Lightness
              </p>
              <p className="mb-6 text-xs text-[var(--color-text-muted)] text-bevel">
                Same hue and chroma — only L changes. Near-white steps reduce C slightly to stay in-gamut.
              </p>
              <ScaleStrip steps={lightnessSteps} />
              <Rule />
              <p className="text-xs leading-6 text-[var(--color-text-muted)] text-bevel">
                The glass panel on each swatch blurs the flat background behind it — so even though
                there's nothing "behind" the swatch in this layout, the blur samples the panel's own
                background colour, giving a faint frosted effect on every chip.
              </p>
            </GlassPanel>

          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════
            § 03 — Semantic tokens
        ══════════════════════════════════════════════════════════════ */}
        <Section
          label="03 — Semantic tokens"
          sub="The four named status colours and the accent, placed in glass panels on their own saturated gradient fields."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                name: 'Accent',
                token: '--color-accent',
                value: 'oklch(0.71 0.17 244)',
                bg: `radial-gradient(circle at 40% 35%, oklch(0.46 0.24 244 / 0.95), oklch(0.16 0.08 252) 70%)`,
                role: 'Primary interactive colour. Links, active states, focus rings, inline code highlights.',
              },
              {
                name: 'Success',
                token: '--color-success',
                value: 'oklch(0.76 0.16 160)',
                bg: `radial-gradient(circle at 40% 35%, oklch(0.48 0.22 155 / 0.90), oklch(0.14 0.06 162) 70%)`,
                role: 'Positive outcomes. Completed states, deploy success, confirmation indicators.',
              },
              {
                name: 'Warning',
                token: '--color-warning',
                value: 'oklch(0.80 0.13 88)',
                bg: `radial-gradient(circle at 40% 35%, oklch(0.60 0.20 82 / 0.90), oklch(0.18 0.07 72) 70%)`,
                role: 'Elevated attention. High memory, stale data, degraded performance alerts.',
              },
              {
                name: 'Danger',
                token: '--color-danger',
                value: 'oklch(0.65 0.19 25)',
                bg: `radial-gradient(circle at 40% 35%, oklch(0.50 0.24 22 / 0.90), oklch(0.16 0.08 12) 70%)`,
                role: 'Destructive or irreversible actions. Delete buttons, critical system errors.',
              },
              {
                name: 'Accent Bright',
                token: '--color-accent-bright',
                value: 'oklch(0.79 0.14 226)',
                bg: `radial-gradient(circle at 40% 35%, oklch(0.52 0.20 220 / 0.88), oklch(0.18 0.07 234) 70%)`,
                role: 'Lighter accent variant. Hover states, code token highlights, active label text.',
              },
            ].map(({ name, token, value, bg, role }) => (
              <div
                key={name}
                className="relative overflow-hidden rounded-[2rem]"
                style={{ background: bg }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.70' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)' opacity='0.040'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px',
                  }}
                />
                <div className="relative z-10 p-5">
                  <GlassPanel intensity="medium" topGlow rounded="rounded-[1.4rem]" className="p-5">
                    <p className="text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
                      {name}
                    </p>
                    <p
                      className="mt-2 font-[var(--font-display)] text-2xl font-[250] tracking-[-0.04em] text-bevel-strong"
                      style={{ color: value }}
                    >
                      ●
                    </p>
                    <Mono>{value}</Mono>
                    <Rule />
                    <p className="text-[0.60rem] leading-5 text-[var(--color-text-muted)] text-bevel">
                      {role}
                    </p>
                    <p className="mt-3 font-[var(--font-code)] text-[0.58rem] text-[var(--color-text-subtle)]">
                      var({token})
                    </p>
                  </GlassPanel>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════
            § 04 — Design system background colours
        ══════════════════════════════════════════════════════════════ */}
        <Section
          label="04 — Background tokens"
          sub="The surface and background tokens that compose the dark base of the interface."
        >
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="overflow-hidden">
            {[
              { token: '--color-bg',             value: 'oklch(0.12 0.030 246)',        role: 'Page background base. The starting hue for the entire interface.' },
              { token: '--color-bg-deep',         value: 'oklch(0.08 0.022 248)',        role: 'Deepest background — used at the very bottom of the page gradient.' },
              { token: '--color-surface',         value: 'oklch(0.23 0.03 254 / 0.76)', role: 'Default glass panel interior. Cards, list items, default surface.' },
              { token: '--color-surface-strong',  value: 'oklch(0.27 0.04 252 / 0.9)',  role: 'Elevated surface — active or focused interactive items.' },
              { token: '--color-surface-muted',   value: 'oklch(0.2 0.024 254 / 0.82)', role: 'Subdued surface — deselected buttons, inactive controls.' },
              { token: '--color-border',          value: 'oklch(0.4 0.044 248 / 0.38)', role: 'Default glass panel border. Subtle edge separation.' },
              { token: '--color-border-strong',   value: 'oklch(0.69 0.13 240 / 0.42)', role: 'Focused/hover border. More visible edge for active states.' },
            ].map(({ token, value, role }) => {
              const solid = value.includes('/') ? value.replace(/\s*\/\s*[\d.]+\s*\)/, ')') : value;
              return (
                <div
                  key={token}
                  className="flex flex-wrap items-center gap-5 border-b border-[var(--color-border)] px-8 py-5 last:border-0"
                >
                  {/* Swatch */}
                  <div
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[0.7rem]"
                    style={{
                      background: solid,
                      border: '1px solid oklch(1 0 0 / 0.10)',
                    }}
                  >
                    <div
                      className="absolute inset-0.5 rounded-[0.5rem]"
                      style={{
                        backdropFilter: 'blur(4px)',
                        background: 'oklch(0.9 0.01 255 / 0.08)',
                        border: '1px solid oklch(1 0 0 / 0.14)',
                      }}
                    />
                  </div>
                  {/* Token name */}
                  <div className="w-56 shrink-0">
                    <Mono>var({token})</Mono>
                  </div>
                  {/* Value */}
                  <div className="w-60 shrink-0">
                    <Mono>{value}</Mono>
                  </div>
                  {/* Role */}
                  <p className="flex-1 text-xs leading-5 text-[var(--color-text-muted)] text-bevel min-w-48">{role}</p>
                </div>
              );
            })}
          </GlassPanel>
        </Section>

      </div>
    </div>
  );
};

export default ColorShowcase;
