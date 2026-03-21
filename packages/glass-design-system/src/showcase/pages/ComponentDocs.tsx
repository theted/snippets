import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GlassPanel,
  GlassPill,
  GlassDivider,
  GlassProvider,
  GlassInput,
  GlassInputWrap,
  GlassTextarea,
  useGlass,
  getGlassStyles,
  GLASS_DEFAULTS,
  type GlassIntensity,
  type GlassPillSize,
  type GlassPillVariant,
} from 'glass-design-system';
import { useBackground } from '../context/BackgroundContext';

// ── Shared layout atoms ───────────────────────────────────────────────────────

const PageSection: React.FC<React.PropsWithChildren<{ id: string }>> = ({ id, children }) => (
  <section id={id} className="mb-32 scroll-mt-24">
    {children}
  </section>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-[var(--color-text-subtle)] text-bevel">
    {children}
  </p>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-[200] leading-[1.05] tracking-[-0.05em] text-[var(--color-text)] text-bevel-strong">
    {children}
  </h2>
);

const SectionSub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] text-bevel">
    {children}
  </p>
);

const DemoLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
    {children}
  </p>
);

// Code token
const Code: React.FC<React.PropsWithChildren> = ({ children }) => (
  <code className="rounded-md border border-[var(--color-border)] bg-[oklch(0.14_0.018_254_/_0.6)] px-1.5 py-0.5 font-[var(--font-code)] text-[0.78em] text-[var(--color-accent-bright)]">
    {children}
  </code>
);

// Inline type badge
const TypeBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded border border-[oklch(0.55_0.14_290_/_0.35)] bg-[oklch(0.55_0.14_290_/_0.08)] px-1.5 py-0.5 font-[var(--font-code)] text-[0.72em] text-[oklch(0.75_0.12_290)]">
    {children}
  </span>
);

const DefaultBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded border border-[oklch(0.55_0.14_160_/_0.35)] bg-[oklch(0.55_0.14_160_/_0.08)] px-1.5 py-0.5 font-[var(--font-code)] text-[0.72em] text-[oklch(0.70_0.14_160)]">
    {children}
  </span>
);

// Props table rendered inside a subtle GlassPanel
interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

const PropsTable: React.FC<{ rows: PropRow[] }> = ({ rows }) => (
  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {['Prop', 'Type', 'Default', 'Description'].map((h) => (
              <th key={h} className="px-5 py-3.5 text-[0.60rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.name} className={i < rows.length - 1 ? 'border-b border-[var(--color-border)]' : ''}>
              <td className="px-5 py-3.5 align-top">
                <Code>{row.name}</Code>
              </td>
              <td className="px-5 py-3.5 align-top">
                <TypeBadge>{row.type}</TypeBadge>
              </td>
              <td className="px-5 py-3.5 align-top">
                {row.default ? <DefaultBadge>{row.default}</DefaultBadge> : <span className="text-[var(--color-text-subtle)]">—</span>}
              </td>
              <td className="px-5 py-3.5 align-top leading-5 text-[var(--color-text-muted)]">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </GlassPanel>
);

// Do / Don't card pair
const DoDont: React.FC<{
  do: { label: string; children: React.ReactNode };
  dont: { label: string; children: React.ReactNode };
}> = ({ do: doItem, dont: dontItem }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {/* Do */}
    <div className="relative pt-4">
      <div className="absolute left-3 top-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.76_0.16_160_/_0.45)] bg-[oklch(0.76_0.16_160_/_0.10)] px-2.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.20em] text-[oklch(0.76_0.16_160)]">
        ✓ {doItem.label}
      </div>
      <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-6 pt-8">
        {doItem.children}
      </GlassPanel>
    </div>
    {/* Don't */}
    <div className="relative pt-4">
      <div className="absolute left-3 top-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.65_0.19_25_/_0.45)] bg-[oklch(0.65_0.19_25_/_0.10)] px-2.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.20em] text-[oklch(0.65_0.19_25)]">
        ✗ {dontItem.label}
      </div>
      <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-6 pt-8">
        {dontItem.children}
      </GlassPanel>
    </div>
  </div>
);

// ── § Glass Form Fields demo ──────────────────────────────────────────────────

const GlassFormFieldsDemo: React.FC = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [lang, setLang] = useState('typescript');
  const [blur, setBlur] = useState(16);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: interactive form */}
      <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8 flex flex-col gap-6">
        <div>
          <p className="mb-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">Title</p>
          <GlassInput
            type="text"
            placeholder="My awesome snippet…"
            value={name}
            fieldBlur={blur}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">Description</p>
          <GlassTextarea
            placeholder="What does this snippet do?"
            rows={4}
            value={desc}
            fieldBlur={blur}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">Language</p>
          <GlassInputWrap fieldBlur={blur}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="block w-full appearance-none bg-transparent px-5 py-4 text-base leading-normal text-[var(--color-text)] focus:outline-none"
            >
              {['typescript', 'javascript', 'python', 'rust', 'go', 'css'].map((l) => (
                <option key={l} value={l} style={{ background: 'oklch(0.14 0.02 254)' }}>{l}</option>
              ))}
            </select>
          </GlassInputWrap>
        </div>
      </GlassPanel>

      {/* Right: blur knob + field states */}
      <div className="flex flex-col gap-6">
        {/* Blur knob */}
        <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
          <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
            Field blur — <span className="text-[var(--color-accent-bright)]">{blur}px</span>
          </p>
          <input
            type="range" min={0} max={40} step={2} value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
          <p className="mt-2 text-[0.62rem] leading-5 text-[var(--color-text-muted)]">
            Drag to see how <Code>fieldBlur</Code> scales the backdrop blur from sharp (0) to frosted (40).
          </p>
        </GlassPanel>

        {/* State reference */}
        <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5 flex flex-col gap-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">Field states</p>
          <div className="flex flex-col gap-3">
            {/* idle */}
            <div>
              <p className="mb-1 text-[0.58rem] text-[var(--color-text-subtle)]">Idle</p>
              <GlassInputWrap focused={false} fieldBlur={blur}>
                <input readOnly value="" placeholder="Idle — no interaction" className="block w-full appearance-none bg-transparent px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none" />
              </GlassInputWrap>
            </div>
            {/* focused */}
            <div>
              <p className="mb-1 text-[0.58rem] text-[var(--color-text-subtle)]">Focused (simulated)</p>
              <GlassInputWrap focused={true} fieldBlur={blur}>
                <input readOnly value="" placeholder="Active — focus glow + bright border" className="block w-full appearance-none bg-transparent px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none" />
              </GlassInputWrap>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

// ── § GlassPanel demos ────────────────────────────────────────────────────────

const INTENSITIES: GlassIntensity[] = ['subtle', 'medium', 'strong'];

const IntensityCard: React.FC<{ intensity: GlassIntensity; active: boolean; onClick: () => void }> = ({
  intensity, active, onClick,
}) => (
  <GlassPanel
    intensity={intensity}
    topGlow={intensity !== 'subtle'}
    bottomGlow={intensity === 'strong'}
    rounded="rounded-[1.8rem]"
    className="cursor-pointer p-6 transition-all duration-300"
    style={{ outline: active ? '2px solid oklch(0.71 0.17 244 / 0.6)' : undefined }}
    onClick={onClick}
  >
    <p className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
      intensity
    </p>
    <p className="mt-1.5 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
      {intensity}
    </p>
    <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
      {intensity === 'subtle' && 'Lowest opacity. Use for secondary containers, row highlights, and inline cards within a page.'}
      {intensity === 'medium' && 'Balanced. The default intensity — use for primary content cards, sidebars, and navigation panels.'}
      {intensity === 'strong' && 'Highest opacity. Use sparingly for modals, overlays, hero sections, and focal CTA surfaces.'}
    </p>
    <div className="mt-4">
      <GlassPill size="xs" variant={active ? 'accent' : 'default'} onClick={onClick}>
        {active ? 'Selected' : 'Select'}
      </GlassPill>
    </div>
  </GlassPanel>
);

// Live GlassPanel with overflow:hidden toggler — illustrates why it matters
const OverflowDemo: React.FC = () => {
  const [clipped, setClipped] = useState(true);
  const glass = getGlassStyles('medium');
  return (
    <div className="space-y-3">
      <div
        className="relative rounded-[1.4rem] p-6"
        style={{ overflow: clipped ? 'hidden' : 'visible', ...glass.panel }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${glass.shimmerColor}, transparent)` }} />
        <div aria-hidden className="pointer-events-none absolute right-[-4rem] top-[-12rem] h-[28rem] w-[58rem] rounded-full"
          style={glass.topRightGlow} />
        <p className="relative z-10 text-xs font-semibold text-[var(--color-text)] text-bevel-strong">
          {clipped ? 'overflow: hidden — glow contained' : 'overflow: visible — glow bleeds into layout'}
        </p>
        <p className="relative z-10 mt-1 text-[0.62rem] leading-5 text-[var(--color-text-muted)] text-bevel">
          The top-right corner glow div is intentionally oversized. Without <Code>overflow-hidden</Code>, it spills into surrounding content.
        </p>
      </div>
      <button
        onClick={() => setClipped((v) => !v)}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition duration-200 hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
      >
        {clipped ? 'Remove overflow: hidden' : 'Restore overflow: hidden'}
      </button>
    </div>
  );
};

// ── § GlassProvider live demo ─────────────────────────────────────────────────

// Shows actual config values from nearest GlassProvider
const ConfigReadout: React.FC = () => {
  const config = useGlass();
  return (
    <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
      <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
        Inherited config from <Code>useGlass()</Code>
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {(Object.entries(config) as [string, number][]).map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-1.5">
            <span className="font-[var(--font-code)] text-[0.65rem] text-[var(--color-accent-bright)]">{k}</span>
            <span className="font-[var(--font-display)] text-sm font-[300] text-[var(--color-text)]">{v}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

const ProviderDemo: React.FC = () => {
  const [blur, setBlur] = useState(40);
  const [opacity, setOpacity] = useState(0.66);
  const [lightAlpha, setLightAlpha] = useState(0.22);
  const [shadowAlpha, setShadowAlpha] = useState(0.20);

  const sliders: { label: string; value: number; set: (v: number) => void; min: number; max: number; step: number }[] = [
    { label: 'blur', value: blur, set: setBlur, min: 8, max: 80, step: 1 },
    { label: 'opacity', value: opacity, set: setOpacity, min: 0.1, max: 1.0, step: 0.01 },
    { label: 'lightAlpha', value: lightAlpha, set: setLightAlpha, min: 0, max: 0.5, step: 0.01 },
    { label: 'shadowAlpha', value: shadowAlpha, set: setShadowAlpha, min: 0, max: 0.5, step: 0.01 },
  ];

  return (
    <GlassProvider blur={blur} opacity={opacity} lightAlpha={lightAlpha} shadowAlpha={shadowAlpha}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sliders */}
        <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-6">
          <p className="mb-5 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
            GlassProvider config
          </p>
          <div className="space-y-5">
            {sliders.map(({ label, value, set, min, max, step }) => (
              <div key={label}>
                <div className="mb-2 flex justify-between">
                  <Code>{label}</Code>
                  <span className="font-[var(--font-display)] text-sm font-[300] text-[var(--color-text)]">{value}</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full" style={{ background: 'oklch(0.28 0.02 254 / 0.5)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${((value - min) / (max - min)) * 100}%`, background: 'var(--color-accent-bright)' }}
                  />
                </div>
                <input
                  type="range" min={min} max={max} step={step} value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="mt-[-0.5rem] w-full cursor-pointer opacity-0" style={{ height: '0.5rem' }}
                />
              </div>
            ))}
          </div>
          <p className="mt-5 text-[0.60rem] leading-5 text-[var(--color-text-subtle)]">
            These props cascade to all <Code>GlassPanel</Code> children via React context.
          </p>
        </GlassPanel>

        {/* Live preview */}
        <div className="space-y-4">
          <GlassPanel intensity="medium" topGlow rounded="rounded-[1.8rem]" className="p-6">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
              medium — hover me
            </p>
            <p className="mt-2 font-[var(--font-display)] text-xl font-[200] tracking-[-0.03em] text-[var(--color-text)] text-bevel-strong">
              Panel inherits provider
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
              Blur, opacity, light and shadow all driven by the provider above.
            </p>
          </GlassPanel>
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
              subtle — same provider
            </p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
              intensity="subtle" scales down relative to the provider's opacity.
            </p>
          </GlassPanel>
          <ConfigReadout />
        </div>
      </div>
    </GlassProvider>
  );
};

// Nested provider demo
const NestedProviderDemo: React.FC = () => (
  <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8">
    <p className="mb-1 text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
      Outer scope — default config
    </p>
    <p className="mb-6 text-xs text-[var(--color-text-muted)] text-bevel">
      blur: {GLASS_DEFAULTS.blur} · opacity: {GLASS_DEFAULTS.opacity}
    </p>
    <GlassProvider blur={24} opacity={0.45}>
      <GlassPanel intensity="medium" topGlow={false} rounded="rounded-[1.4rem]" className="p-6">
        <p className="mb-1 text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[oklch(0.75_0.16_244)] text-bevel">
          Inner scope — <Code>{'<GlassProvider blur={24} opacity={0.45}>'}</Code>
        </p>
        <p className="text-xs text-[var(--color-text-muted)] text-bevel">
          This nested panel blurs less and is more transparent — ideal for
          pricing tiers or feature cards that sit inside a hero panel.
        </p>
        <div className="mt-4 flex gap-2">
          <GlassPill size="sm" variant="accent">Primary</GlassPill>
          <GlassPill size="sm">Secondary</GlassPill>
        </div>
      </GlassPanel>
    </GlassProvider>
  </GlassPanel>
);

// ── § GlassPill demos ─────────────────────────────────────────────────────────

const SIZES: GlassPillSize[] = ['xs', 'sm', 'md', 'lg'];
const VARIANTS: GlassPillVariant[] = ['default', 'active', 'accent'];

// ── Page ──────────────────────────────────────────────────────────────────────

const ComponentDocs: React.FC = () => {
  const { isDawn } = useBackground();
  const [activeIntensity, setActiveIntensity] = useState<GlassIntensity>('medium');

  const textColor = isDawn ? 'oklch(0.22 0.03 50)' : undefined;

  return (
    <div className="relative min-h-screen" style={{ color: textColor }}>
      <div className="mx-auto px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,6vw,5rem)]" style={{ maxWidth: '96rem' }}>

        {/* Back nav */}
        <Link
          to="/"
          className="mb-16 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] transition duration-200"
          style={{ color: isDawn ? 'oklch(0.38 0.05 50)' : 'var(--color-text-subtle)' }}
        >
          ← Back
        </Link>

        {/* Hero */}
        <div className="mb-20">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em]" style={{ color: isDawn ? 'oklch(0.45 0.06 55)' : 'var(--color-text-subtle)' }}>
            Glass Design System
          </p>
          <h1
            className="mt-3 font-[var(--font-display)] text-[clamp(3rem,9vw,6rem)] font-[200] leading-[0.92] tracking-[-0.07em]"
            style={{ color: isDawn ? 'oklch(0.18 0.04 45)' : 'var(--color-text)' }}
          >
            Components
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7" style={{ color: isDawn ? 'oklch(0.36 0.04 50)' : 'var(--color-text-muted)' }}>
            The full API reference for every component in the system —
            props, intensities, variants, live examples, and rules for correct use.
            This page is itself built with the design system.
          </p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { label: 'GlassPanel', id: 'glass-panel' },
              { label: 'GlassPill', id: 'glass-pill' },
              { label: 'GlassDivider', id: 'glass-divider' },
              { label: 'GlassProvider', id: 'glass-provider' },
              { label: 'getGlassStyles', id: 'get-glass-styles' },
              { label: 'Glass Form Fields', id: 'form-fields' },
            ].map(({ label, id }) => (
              <GlassPill key={id} size="sm" as="a" href={`#${id}`}>
                {label}
              </GlassPill>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════ GlassPanel */}
        <PageSection id="glass-panel">
          <SectionLabel>Component</SectionLabel>
          <SectionTitle>GlassPanel</SectionTitle>
          <SectionSub>
            The core surface of the system. A frosted glass container that provides
            backdrop-blur, ambient glows, a top-edge shimmer line, and cursor-reactive
            light and shadow on hover. All intensity scaling is driven by the nearest{' '}
            <Code>{'<GlassProvider>'}</Code>.
          </SectionSub>

          <GlassDivider className="my-10" />

          {/* Intensity live demo */}
          <DemoLabel>Intensity — click to select</DemoLabel>
          <div className="grid gap-4 sm:grid-cols-3">
            {INTENSITIES.map((int) => (
              <IntensityCard
                key={int}
                intensity={int}
                active={activeIntensity === int}
                onClick={() => setActiveIntensity(int)}
              />
            ))}
          </div>

          {/* Selected intensity code snippet */}
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.2rem]" className="mt-4 p-4">
            <p className="font-[var(--font-code)] text-[0.72rem] text-[var(--color-text-muted)]">
              <span className="text-[oklch(0.75_0.12_290)]">{'<GlassPanel'}</span>
              {' '}
              <span className="text-[var(--color-accent-bright)]">intensity</span>
              <span className="text-[var(--color-text-subtle)]">{"={"}</span>
              <span className="text-[oklch(0.76_0.16_160)]">"{activeIntensity}"</span>
              <span className="text-[var(--color-text-subtle)]">{"}"}</span>
              {' '}
              <span className="text-[var(--color-accent-bright)]">topGlow</span>
              <span className="text-[var(--color-text-subtle)]">{"={"}</span>
              <span className="text-[oklch(0.76_0.16_160)]">{activeIntensity !== 'subtle' ? 'true' : 'false'}</span>
              <span className="text-[var(--color-text-subtle)]">{"}"}</span>
              {activeIntensity === 'strong' && (
                <>
                  {' '}
                  <span className="text-[var(--color-accent-bright)]">bottomGlow</span>
                  <span className="text-[var(--color-text-subtle)]">{"={true}"}</span>
                </>
              )}
              <span className="text-[oklch(0.75_0.12_290)]">{' />'}</span>
            </p>
          </GlassPanel>

          <GlassDivider className="my-10" />

          {/* Props */}
          <DemoLabel>Props</DemoLabel>
          <PropsTable rows={[
            { name: 'intensity', type: "'subtle' | 'medium' | 'strong'", default: "'medium'", description: 'Surface opacity/blur depth. Scales proportionally against the GlassProvider config.' },
            { name: 'topGlow', type: 'boolean', default: 'true', description: 'Renders a large soft radial glow in the top-right corner (deep blue ambient light).' },
            { name: 'bottomGlow', type: 'boolean', default: 'false', description: 'Renders a softer counter-glow in the bottom-left corner (teal). Use on strong panels to add depth.' },
            { name: 'rounded', type: 'string', default: "'rounded-[2.2rem]'", description: 'Tailwind border-radius class. The overflow:hidden on the wrapper clips all glows to this radius.' },
            { name: 'as', type: 'React.ElementType', default: "'div'", description: "Render as a different element — e.g. as='section', as='form', as='article'." },
            { name: 'className', type: 'string', default: "''", description: 'Additional Tailwind classes. Padding, grid layout, and spacing all go here.' },
            { name: 'style', type: 'React.CSSProperties', default: '—', description: 'Inline styles merged into the wrapper. Useful for dynamic width/height values.' },
            { name: '...rest', type: 'unknown', default: '—', description: 'All other props are spread onto the root element (onClick, data-*, aria-*, etc.).' },
          ]} />

          <GlassDivider className="my-10" />

          {/* Do's and Don'ts */}
          <DemoLabel>Do's & Don'ts</DemoLabel>
          <div className="space-y-4">
            <DoDont
              do={{
                label: 'Match intensity to hierarchy',
                children: (
                  <div className="space-y-2">
                    <GlassPanel intensity="strong" rounded="rounded-xl" className="p-4">
                      <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">strong — modal / hero</p>
                    </GlassPanel>
                    <GlassPanel intensity="medium" rounded="rounded-xl" className="p-4">
                      <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel">medium — card</p>
                    </GlassPanel>
                    <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-xl" className="p-4">
                      <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel">subtle — row / inline</p>
                    </GlassPanel>
                    <p className="mt-2 text-[0.60rem] leading-5 text-[var(--color-text-muted)]">Use strong for focus, medium for content, subtle for density.</p>
                  </div>
                ),
              }}
              dont={{
                label: "Don't stack strong inside strong",
                children: (
                  <GlassPanel intensity="strong" bottomGlow rounded="rounded-xl" className="p-4">
                    <GlassPanel intensity="strong" rounded="rounded-lg" className="p-3">
                      <p className="text-[0.60rem] font-semibold text-[var(--color-text)]">strong inside strong</p>
                      <p className="mt-1 text-[0.58rem] text-[var(--color-text-muted)]">Compounding opacity makes everything opaque — the glass effect is lost.</p>
                    </GlassPanel>
                  </GlassPanel>
                ),
              }}
            />
            <DoDont
              do={{
                label: 'Always put content in relative z-10',
                children: (
                  <div className="space-y-2">
                    <GlassPanel intensity="medium" rounded="rounded-xl" className="p-4">
                      <p className="relative z-10 text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Content</p>
                      <p className="relative z-10 mt-1 text-[0.58rem] text-[var(--color-text-muted)] text-bevel">The glow divs are absolute-positioned. Give your content z-10 so it renders on top.</p>
                    </GlassPanel>
                  </div>
                ),
              }}
              dont={{
                label: "Don't forget overflow-hidden on wrappers",
                children: (
                  <>
                    <OverflowDemo />
                  </>
                ),
              }}
            />
            <DoDont
              do={{
                label: 'Use text-bevel for legibility',
                children: (
                  <GlassPanel intensity="medium" rounded="rounded-xl" className="p-5">
                    <p className="text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">Label</p>
                    <p className="mt-1 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">Title</p>
                    <p className="mt-1.5 text-xs text-[var(--color-text-muted)] text-bevel">Body copy with text-bevel.</p>
                  </GlassPanel>
                ),
              }}
              dont={{
                label: "Don't use flat white on glass",
                children: (
                  <GlassPanel intensity="medium" rounded="rounded-xl" className="p-5">
                    <p className="text-[0.60rem] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgb(200, 200, 200)' }}>Label</p>
                    <p className="mt-1 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em]" style={{ color: 'white' }}>Title</p>
                    <p className="mt-1.5 text-xs" style={{ color: 'rgb(180, 180, 180)' }}>Body copy without text-bevel — flat against the frosted surface.</p>
                  </GlassPanel>
                ),
              }}
            />
          </div>
        </PageSection>

        <GlassDivider className="mb-32" />

        {/* ══════════════════════════════════════════════════════ GlassPill */}
        <PageSection id="glass-pill">
          <SectionLabel>Component</SectionLabel>
          <SectionTitle>GlassPill</SectionTitle>
          <SectionSub>
            The canonical chrome button and link of the system. Handles sizing,
            backdrop-blur surface, text-bevel, hover lift, and focus rings automatically.
            Polymorphic: render as <Code>{'<button>'}</Code>, <Code>{'<a>'}</Code>,
            or a router <Code>Link</Code> via the <Code>as</Code> prop.
          </SectionSub>

          <GlassDivider className="my-10" />

          {/* Size demo */}
          <DemoLabel>Sizes</DemoLabel>
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-6">
            <div className="flex flex-wrap items-end gap-3">
              {SIZES.map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <GlassPill size={size}>{size}</GlassPill>
                  <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
                    {size === 'xs' && '0.60rem'}
                    {size === 'sm' && '0.68rem'}
                    {size === 'md' && '0.68rem'}
                    {size === 'lg' && '0.72rem'}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[0.62rem] leading-5 text-[var(--color-text-muted)]">
              <Code>xs</Code> — layout toggles, tiny controls &ensp;·&ensp;
              <Code>sm</Code> — card controls, compact nav &ensp;·&ensp;
              <Code>md</Code> — standard nav (more padding than sm) &ensp;·&ensp;
              <Code>lg</Code> — top-level toolbar actions and hero CTAs
            </p>
          </GlassPanel>

          <GlassDivider className="my-10" />

          {/* Variant demo */}
          <DemoLabel>Variants</DemoLabel>
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              {VARIANTS.map((v) => (
                <GlassPill key={v} variant={v}>{v}</GlassPill>
              ))}
            </div>
            <GlassDivider className="my-5" />
            <div className="grid gap-4 text-[0.62rem] leading-5 text-[var(--color-text-muted)] sm:grid-cols-3">
              <div>
                <p className="mb-1 font-semibold text-[var(--color-text-subtle)]">default</p>
                <p>Muted surface. Lifts to <Code>surface</Code> on hover. Use for inactive controls, secondary navigation, and tag lists.</p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[var(--color-text-subtle)]">active</p>
                <p>Already-selected state. Permanently elevated surface, no hover shift. Use to reflect current route or filter.</p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[var(--color-text-subtle)]">accent</p>
                <p>Sapphire-tinted. Use for the primary action in a group, active filters, or highlighted links.</p>
              </div>
            </div>
          </GlassPanel>

          <GlassDivider className="my-10" />

          {/* Polymorphic as= */}
          <DemoLabel>Polymorphic — the <Code>as</Code> prop</DemoLabel>
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <GlassPill size="sm">as="button" (default)</GlassPill>
              <GlassPill size="sm" as="a" href="#glass-pill">as="a"</GlassPill>
              <GlassPill size="sm" as={Link} to="/product">as={'{Link}'} to="/product"</GlassPill>
            </div>
            <p className="mt-5 text-[0.62rem] leading-5 text-[var(--color-text-muted)]">
              The underlying element changes with <Code>as</Code> — styles are identical, but
              semantics, keyboard role, and routing behaviour follow the element type.
              All extra props (<Code>href</Code>, <Code>to</Code>, <Code>onClick</Code>) are forwarded.
            </p>
          </GlassPanel>

          <GlassDivider className="my-10" />

          {/* Props */}
          <DemoLabel>Props</DemoLabel>
          <PropsTable rows={[
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Sets padding, font size, and letter-spacing tier.' },
            { name: 'variant', type: "'default' | 'active' | 'accent'", default: "'default'", description: 'Controls border, background, and text colour treatment.' },
            { name: 'as', type: 'React.ElementType', default: "'button'", description: "Polymorphic root element. Pass a React Router Link for internal navigation." },
            { name: 'className', type: 'string', default: "''", description: 'Additional Tailwind classes merged with the base styles.' },
            { name: '...rest', type: 'unknown', default: '—', description: 'All other props forwarded to the root element (href, to, onClick, disabled, etc.).' },
          ]} />

          <GlassDivider className="my-10" />

          {/* Do's and Don'ts */}
          <DemoLabel>Do's & Don'ts</DemoLabel>
          <div className="space-y-4">
            <DoDont
              do={{
                label: 'Use as={Link} for router nav',
                children: (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <GlassPill size="sm" as={Link} to="/product" variant="accent">Product</GlassPill>
                      <GlassPill size="sm" as={Link} to="/philosophy">Philosophy</GlassPill>
                    </div>
                    <p className="text-[0.60rem] leading-5 text-[var(--color-text-muted)]">Renders a proper <Code>{'<a>'}</Code> with correct keyboard and screen-reader semantics.</p>
                  </div>
                ),
              }}
              dont={{
                label: "Don't wrap in a plain <button>",
                children: (
                  <div className="space-y-3">
                    <button className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                      Looks like a GlassPill
                    </button>
                    <p className="text-[0.60rem] leading-5 text-[var(--color-text-muted)]">No backdrop-blur, no text-bevel, no hover lift, no focus ring — reimplementing what GlassPill already provides.</p>
                  </div>
                ),
              }}
            />
            <DoDont
              do={{
                label: 'Reflect current state with variant',
                children: (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <GlassPill size="xs" variant="active">Grid</GlassPill>
                      <GlassPill size="xs">List</GlassPill>
                      <GlassPill size="xs">Table</GlassPill>
                    </div>
                    <p className="text-[0.60rem] leading-5 text-[var(--color-text-muted)]">The selected control uses <Code>variant="active"</Code> — no custom CSS needed.</p>
                  </div>
                ),
              }}
              dont={{
                label: "Don't use for long labels",
                children: (
                  <div className="space-y-2">
                    <GlassPill size="sm">This label is way too long for a pill button</GlassPill>
                    <p className="text-[0.60rem] leading-5 text-[var(--color-text-muted)]">GlassPill is designed for short identifiers (1–3 words). Long text stretches the pill unnaturally.</p>
                  </div>
                ),
              }}
            />
          </div>
        </PageSection>

        <GlassDivider className="mb-32" />

        {/* ══════════════════════════════════════════════════════ GlassDivider */}
        <PageSection id="glass-divider">
          <SectionLabel>Component</SectionLabel>
          <SectionTitle>GlassDivider</SectionTitle>
          <SectionSub>
            A 1px horizontal rule that fades to transparent at both ends — atmosphere over hard lines.
            Uses the <Code>--color-border</Code> token so it reads as part of the glass surface
            rather than cutting through it.
          </SectionSub>

          <GlassDivider className="my-10" />

          {/* Live demo */}
          <DemoLabel>Live example</DemoLabel>
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Section A</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">Content before the divider. The rule fades out at both edges, never touching the panel border.</p>
            <GlassDivider className="my-6" />
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Section B</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">Content after the divider. Use vertical spacing via <Code>className="my-6"</Code> etc.</p>
            <GlassDivider className="my-6" />
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Section C</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">A third section. Consistent rhythm through the panel.</p>
          </GlassPanel>

          <GlassDivider className="my-10" />

          {/* Props */}
          <DemoLabel>Props</DemoLabel>
          <PropsTable rows={[
            { name: 'className', type: 'string', default: "''", description: 'Tailwind classes for vertical spacing (my-6, my-10, etc.) and width constraints.' },
          ]} />

          <GlassDivider className="my-10" />

          <DemoLabel>Do's & Don'ts</DemoLabel>
          <div className="space-y-4">
            <DoDont
              do={{
                label: 'Use inside panels for section rhythm',
                children: (
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-xl" className="p-5">
                    <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Metadata</p>
                    <GlassDivider className="my-3" />
                    <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Content</p>
                    <GlassDivider className="my-3" />
                    <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Actions</p>
                  </GlassPanel>
                ),
              }}
              dont={{
                label: "Don't place adjacent to a panel's border",
                children: (
                  <GlassPanel intensity="medium" topGlow={false} rounded="rounded-xl" className="overflow-hidden">
                    <GlassDivider />
                    <div className="p-5">
                      <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Content</p>
                      <p className="mt-1 text-[0.58rem] text-[var(--color-text-muted)] text-bevel">The divider flush with the top edge creates a double-line that competes with the panel border.</p>
                    </div>
                  </GlassPanel>
                ),
              }}
            />
          </div>
        </PageSection>

        <GlassDivider className="mb-32" />

        {/* ══════════════════════════════════════════════════════ GlassProvider */}
        <PageSection id="glass-provider">
          <SectionLabel>Context provider</SectionLabel>
          <SectionTitle>GlassProvider</SectionTitle>
          <SectionSub>
            Cascades four config values (<Code>blur</Code>, <Code>opacity</Code>,{' '}
            <Code>lightAlpha</Code>, <Code>shadowAlpha</Code>) to all{' '}
            <Code>GlassPanel</Code> descendants via React context. Providers can be
            nested — inner values override the inherited ones while leaving the rest intact.
          </SectionSub>

          <GlassDivider className="my-10" />

          {/* Live slider demo */}
          <DemoLabel>Live config — drag sliders</DemoLabel>
          <ProviderDemo />

          <GlassDivider className="my-10" />

          {/* Nested demo */}
          <DemoLabel>Nested providers</DemoLabel>
          <NestedProviderDemo />

          <GlassDivider className="my-10" />

          {/* Props */}
          <DemoLabel>Props (all optional)</DemoLabel>
          <PropsTable rows={[
            { name: 'blur', type: 'number', default: '40', description: 'backdrop-filter blur in px. Lower = more see-through. Higher = more frosted.' },
            { name: 'opacity', type: 'number', default: '0.66', description: 'Background alpha multiplier (0–1). All panel intensity alphas scale against this value.' },
            { name: 'lightAlpha', type: 'number', default: '0.22', description: 'Specular wash intensity on hover (0–1). Controls how brightly the panel catches simulated light.' },
            { name: 'shadowAlpha', type: 'number', default: '0.20', description: 'Opposite-side shadow intensity on hover (0–1). Controls depth perception on cursor interaction.' },
            { name: 'children', type: 'React.ReactNode', default: '—', description: 'All descendants. GlassPanel anywhere in the tree reads the nearest provider.' },
          ]} />

          <GlassDivider className="my-10" />

          <DemoLabel>Do's & Don'ts</DemoLabel>
          <div className="space-y-4">
            <DoDont
              do={{
                label: 'One root provider near the app root',
                children: (
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-xl" className="p-5">
                    <p className="font-[var(--font-code)] text-[0.65rem] leading-6 text-[var(--color-text-muted)]">
                      <span className="text-[oklch(0.75_0.12_290)]">{'<GlassProvider>'}</span><br />
                      {'  '}<span className="text-[oklch(0.75_0.12_290)]">{'<App />'}</span><br />
                      <span className="text-[oklch(0.75_0.12_290)]">{'</GlassProvider>'}</span>
                    </p>
                    <p className="mt-3 text-[0.60rem] leading-5 text-[var(--color-text-muted)]">One provider gives the entire app a consistent glass theme without prop drilling.</p>
                  </GlassPanel>
                ),
              }}
              dont={{
                label: "Don't add providers inside every component",
                children: (
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-xl" className="p-5">
                    <p className="font-[var(--font-code)] text-[0.65rem] leading-6 text-[oklch(0.65_0.19_25)]">
                      {'// Every Card wraps itself — spreads configs everywhere'}<br />
                      <span className="text-[oklch(0.75_0.12_290)]">{'<GlassProvider blur={30}>'}</span><br />
                      {'  '}<span className="text-[oklch(0.75_0.12_290)]">{'<GlassPanel> ... </GlassPanel>'}</span><br />
                      <span className="text-[oklch(0.75_0.12_290)]">{'</GlassProvider>'}</span>
                    </p>
                    <p className="mt-3 text-[0.60rem] leading-5 text-[var(--color-text-muted)]">Results in unpredictable cascades and makes global rethemes impossible.</p>
                  </GlassPanel>
                ),
              }}
            />
            <DoDont
              do={{
                label: 'Nest to adjust a specific section',
                children: (
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-xl" className="p-5">
                    <p className="font-[var(--font-code)] text-[0.65rem] leading-6 text-[var(--color-text-muted)]">
                      <span className="text-[oklch(0.75_0.12_290)]">{'<GlassProvider>'}</span>{' '}
                      <span className="text-[var(--color-text-subtle)]">{'// app root'}</span><br />
                      {'  '}<span className="text-[oklch(0.75_0.12_290)]">{'<GlassProvider blur={24} opacity={0.45}>'}</span><br />
                      {'    '}<span className="text-[oklch(0.75_0.12_290)]">{'<PricingSection />'}</span><br />
                      {'  '}<span className="text-[oklch(0.75_0.12_290)]">{'</GlassProvider>'}</span><br />
                      <span className="text-[oklch(0.75_0.12_290)]">{'</GlassProvider>'}</span>
                    </p>
                    <p className="mt-3 text-[0.60rem] leading-5 text-[var(--color-text-muted)]">Purposeful nesting for a section that needs lighter, less blurry panels.</p>
                  </GlassPanel>
                ),
              }}
              dont={{
                label: "Don't set opacity > 1",
                children: (
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-xl" className="p-5">
                    <p className="font-[var(--font-code)] text-[0.65rem] text-[oklch(0.65_0.19_25)]">
                      {'<GlassProvider opacity={1.5}>'}<br />
                      {'  // alphas exceed 1.0 → panels look solid'}
                    </p>
                    <p className="mt-3 text-[0.60rem] leading-5 text-[var(--color-text-muted)]">No clamping is applied. Values above 1 push alpha channels beyond 100% and remove the glass translucency.</p>
                  </GlassPanel>
                ),
              }}
            />
          </div>
        </PageSection>

        <GlassDivider className="mb-32" />

        {/* ══════════════════════════════════════════════════════ getGlassStyles */}
        <PageSection id="get-glass-styles">
          <SectionLabel>Utility function</SectionLabel>
          <SectionTitle>getGlassStyles</SectionTitle>
          <SectionSub>
            The raw style-computation function that powers <Code>GlassPanel</Code>.
            Returns a <Code>GlassStyles</Code> object you can apply to any element
            directly — useful when you need glass surfaces that aren't panels,
            or when you're integrating with non-React rendering.
          </SectionSub>

          <GlassDivider className="my-10" />

          {/* Signature */}
          <DemoLabel>Signature</DemoLabel>
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-6">
            <pre className="overflow-x-auto font-[var(--font-code)] text-[0.72rem] leading-6 text-[var(--color-text-muted)]">
              <code>
                <span className="text-[var(--color-accent-bright)]">function</span>
                {' '}
                <span className="text-[oklch(0.75_0.12_290)]">getGlassStyles</span>
                {'(\n'}
                {'  '}
                <span className="text-[var(--color-accent-bright)]">intensity</span>
                {': '}
                <span className="text-[oklch(0.75_0.12_290)]">GlassIntensity</span>
                {" = 'medium',\n"}
                {'  '}
                <span className="text-[var(--color-accent-bright)]">config</span>
                {': '}
                <span className="text-[oklch(0.75_0.12_290)]">GlassConfig</span>
                {' = GLASS_DEFAULTS,\n'}
                {'): '}
                <span className="text-[oklch(0.75_0.12_290)]">GlassStyles</span>
              </code>
            </pre>
          </GlassPanel>

          <GlassDivider className="my-10" />

          {/* Return shape */}
          <DemoLabel>Return value — GlassStyles</DemoLabel>
          <PropsTable rows={[
            { name: 'panel', type: 'CSSProperties', default: '—', description: 'Spread directly onto the panel root: background, backdropFilter, border, boxShadow.' },
            { name: 'shimmerColor', type: 'string', default: '—', description: 'Colour value for the 1px top-edge shimmer gradient.' },
            { name: 'topRightGlow', type: 'CSSProperties', default: '—', description: 'background + filter for the oversized top-right ambient glow div.' },
            { name: 'bottomLeftGlow', type: 'CSSProperties', default: '—', description: 'background + filter for the optional bottom-left counter-glow div.' },
          ]} />

          <GlassDivider className="my-10" />

          {/* Usage example */}
          <DemoLabel>When to use raw vs component</DemoLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
              <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[oklch(0.76_0.16_160)] text-bevel">
                Use GlassPanel (preferred)
              </p>
              <p className="text-[0.62rem] leading-5 text-[var(--color-text-muted)]">
                You get hover-reactive light/shadow, shimmer line, glows, and
                correct <Code>overflow-hidden</Code> for free. Always prefer the
                component unless you have a specific reason not to.
              </p>
            </GlassPanel>
            <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
              <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">
                Use getGlassStyles when…
              </p>
              <ul className="space-y-1.5 text-[0.62rem] leading-5 text-[var(--color-text-muted)]">
                <li>· Applying glass to non-div elements (like an SVG <Code>{'<foreignObject>'}</Code>)</li>
                <li>· Building a custom interactive widget that already manages its own mouse tracking</li>
                <li>· Integrating with a non-React renderer or CSS-in-JS solution</li>
                <li>· Reading a single value like <Code>shimmerColor</Code> for an animation</li>
              </ul>
            </GlassPanel>
          </div>

          {/* Raw usage example */}
          <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="mt-4 p-5">
            <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">Example — manual glass button</p>
            <pre className="overflow-x-auto font-[var(--font-code)] text-[0.70rem] leading-6 text-[var(--color-text-muted)]">
              <code>
                {`const config = useGlass();\nconst glass  = getGlassStyles('medium', config);\n\n`}
                <span className="text-[oklch(0.75_0.12_290)]">{'<button'}</span>
                {'\n  style={{ ...glass.panel }}\n'}
                {'  className="relative overflow-hidden rounded-full px-5 py-2.5"\n'}
                <span className="text-[oklch(0.75_0.12_290)]">{'>'}</span>
                {'\n  '}
                <span className="text-[oklch(0.75_0.12_290)]">{'<div'}</span>
                {' style={glass.topRightGlow} className="absolute ..."/>\n  '}
                {`Submit\n`}
                <span className="text-[oklch(0.75_0.12_290)]">{'</button>'}</span>
              </code>
            </pre>
          </GlassPanel>
        </PageSection>

        {/* ── § Glass Form Fields ──────────────────────────────────────────────── */}
        <PageSection id="form-fields">
          <SectionLabel>Components</SectionLabel>
          <SectionTitle>Glass Form Fields</SectionTitle>
          <SectionSub>
            Frosted-glass inputs inherit the same depth language as panels — translucent background,
            top-edge shimmer, and a glowing focus ring that echoes the ambient accent colour.
          </SectionSub>

          <GlassDivider className="my-10" />

          {/* Live demo */}
          <DemoLabel>Live demo — interact with the fields</DemoLabel>
          <GlassFormFieldsDemo />

          <GlassDivider className="my-10" />

          {/* GlassInput API */}
          <DemoLabel>GlassInput — props</DemoLabel>
          <PropsTable rows={[
            { name: 'fieldBlur',        type: 'number',  default: '16',   description: 'backdrop-filter blur in px. Lower = more clear, higher = more frosted.' },
            { name: 'shimmer',          type: 'boolean', default: 'true',  description: 'Show the 1 px top-edge highlight line.' },
            { name: 'wrapperClassName', type: 'string',  default: '—',    description: 'Extra class applied to the outer glass wrapper div.' },
            { name: 'wrapperStyle',     type: 'CSSProperties', default: '—', description: 'Inline styles merged into the wrapper div (e.g. custom border-radius).' },
          ]} />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Usage snippet — GlassInput */}
            <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
              <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
                <Code>GlassInput</Code> — basic usage
              </p>
              <pre className="overflow-x-auto font-[var(--font-code)] text-[0.68rem] leading-6 text-[var(--color-text-muted)]"><code>{`import { GlassInput, GlassTextarea } from 'glass-design-system';

// Single-line input
<GlassInput
  type="text"
  placeholder="Search snippets…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>

// Multi-line textarea
<GlassTextarea
  placeholder="Description…"
  rows={4}
  value={desc}
  onChange={(e) => setDesc(e.target.value)}
/>`}</code></pre>
            </GlassPanel>

            {/* Usage snippet — GlassInputWrap */}
            <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
              <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
                <Code>GlassInputWrap</Code> — custom elements
              </p>
              <pre className="overflow-x-auto font-[var(--font-code)] text-[0.68rem] leading-6 text-[var(--color-text-muted)]"><code>{`import { GlassInputWrap } from 'glass-design-system';

// Wrap any element — <select>, custom inputs, etc.
// The wrapper listens to focus/blur on its children
// automatically via onFocus/onBlur bubbling.
<GlassInputWrap>
  <select className="block w-full bg-transparent
      px-5 py-4 focus:outline-none">
    <option>JavaScript</option>
    <option>TypeScript</option>
  </select>
</GlassInputWrap>

// Pass radius for non-standard shapes
<GlassInputWrap radius="9999px">
  <input className="block w-full bg-transparent
      px-6 py-3 focus:outline-none" />
</GlassInputWrap>`}</code></pre>
            </GlassPanel>
          </div>

          {/* Design notes */}
          <div className="mt-6">
            <DoDont
              do={{
                label: 'transparent bg on the element',
                children: (
                  <div className="space-y-2 text-[0.70rem] leading-5 text-[var(--color-text-muted)]">
                    <p>Set <Code>bg-transparent</Code> (or <Code>background: transparent</Code>) on the inner <Code>{'<input>'}</Code> so the wrapper's <Code>backdrop-filter</Code> shows through.</p>
                    <p className="text-[var(--color-success)]">The glass blur is on the wrapper — the input is a clear window into it.</p>
                  </div>
                ),
              }}
              dont={{
                label: 'opaque bg on the element',
                children: (
                  <div className="space-y-2 text-[0.70rem] leading-5 text-[var(--color-text-muted)]">
                    <p>Using a solid background on the input (<Code>bg-[var(--color-glass-field)]</Code>) blocks the blur from showing through, defeating the glassmorphic effect.</p>
                    <p className="text-[var(--color-danger)]">You get a flat, opaque field instead of a frosted one.</p>
                  </div>
                ),
              }}
            />
          </div>
        </PageSection>

        {/* Footer */}
        <GlassDivider className="mb-16" />
        <div className="flex flex-wrap items-center justify-between gap-4 pb-16">
          <p className="text-[0.62rem] text-[var(--color-text-subtle)]">
            Glass Design System — built with itself
          </p>
          <div className="flex gap-2">
            <GlassPill size="xs" as={Link} to="/">Showcase</GlassPill>
            <GlassPill size="xs" as={Link} to="/product">Product demo</GlassPill>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComponentDocs;
