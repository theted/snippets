import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, GLASS_BLUR, GLASS_OPACITY, getGlassStyles } from 'glass-design-system';
import { useBackground } from '../context/BackgroundContext';

// ── Inline tinted panel — wraps GlassPanel with a colour wash overlay ──────

type TintedPanelProps = React.PropsWithChildren<{
  label: string;
  sub?: string;
  /** oklch(...) colour token for the tint overlay */
  tint: string;
  rounded?: string;
  className?: string;
}>;

const TintedPanel: React.FC<TintedPanelProps> = ({ label, sub, tint, rounded, className = '', children }) => (
  <GlassPanel intensity="medium" topGlow rounded={rounded ?? 'rounded-[2rem]'} className={`p-7 ${className}`}>
    {/* Colour wash sits on top of the glass base */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ background: tint, mixBlendMode: 'screen', opacity: 0.18 }}
    />
    <p className="relative z-10 text-[0.62rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
      {label}
    </p>
    {sub && (
      <p className="relative z-10 mt-1 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">{sub}</p>
    )}
    {children && <div className="relative z-10 mt-4">{children}</div>}
  </GlassPanel>
);

// ── Manual blur-level panel — bypasses GlassPanel to demo raw blur values ───

type BlurPanelProps = { blur: number; label: string; sub: string };

const BlurPanel: React.FC<BlurPanelProps> = ({ blur, label, sub }) => {
  const glass = getGlassStyles('medium');
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] p-7"
      style={{ ...glass.panel, backdropFilter: `blur(${blur}px)` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${glass.shimmerColor}, transparent)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-4rem] top-[-12rem] h-[28rem] w-[58rem] rounded-full"
        style={glass.topRightGlow}
      />
      <p className="relative z-10 text-[0.62rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
        {label}
      </p>
      <p className="relative z-10 mt-1 font-[var(--font-display)] text-3xl font-[200] tracking-[-0.05em] text-[var(--color-text)] text-bevel-strong">
        {blur}px
      </p>
      <p className="relative z-10 mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">{sub}</p>
    </div>
  );
};

// ── Prose content reused inside several panels ────────────────────────────────

const SampleContent: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <>
    <p className="font-[var(--font-display)] text-xl font-[300] tracking-[-0.03em] text-[var(--color-text)] text-bevel-strong">
      {title}
    </p>
    <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">{body}</p>
  </>
);

// ── § 09 — Tips & Tricks components ──────────────────────────────────────────

// Tip: the 1 px shimmer line that simulates a glass rim catching light
const TipShimmer: React.FC = () => {
  const [on, setOn] = useState(true);
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.4rem] p-6"
        style={{ background: 'oklch(0.20 0.024 254 / 0.50)', backdropFilter: 'blur(24px)', border: '1px solid oklch(0.48 0.06 248 / 0.28)', boxShadow: 'inset 0 1px 0 oklch(0.82 0.1 230 / 0.10)' }}>
        {on && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.50), transparent)' }} />
        )}
        <p className="text-xs font-semibold text-[var(--color-text)] text-bevel-strong">Glass panel</p>
        <p className="mt-1 text-[0.62rem] text-[var(--color-text-muted)] text-bevel">
          {on ? 'Shimmer line visible — glass rim catches the light' : 'No shimmer — panel looks flat, like painted metal'}
        </p>
      </div>
      <button onClick={() => setOn(!on)}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition duration-200 hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]">
        {on ? 'Remove shimmer' : 'Restore shimmer'}
      </button>
    </div>
  );
};

// Tip: screen-blend tint opacity sweet spot (0.14–0.22)
const TipTintRange: React.FC = () => {
  const [alpha, setAlpha] = useState(0.18);
  const isSweet = alpha >= 0.13 && alpha <= 0.23;
  const isPainted = alpha > 0.30;
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.4rem] p-6"
        style={{ background: 'oklch(0.20 0.024 254 / 0.50)', backdropFilter: 'blur(24px)', border: '1px solid oklch(0.48 0.06 248 / 0.28)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-150"
          style={{ background: 'oklch(0.58 0.26 290)', mixBlendMode: 'screen', opacity: alpha }} />
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.40), transparent)' }} />
        <p className="relative z-10 text-xs font-semibold text-[var(--color-text)] text-bevel-strong">Violet tint</p>
        <p className="relative z-10 mt-1 text-[0.62rem] text-[var(--color-text-muted)] text-bevel">
          opacity {alpha.toFixed(2)} ·{' '}
          <span style={{ color: isPainted ? 'var(--color-danger)' : isSweet ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {isPainted ? 'painted — texture lost' : isSweet ? 'sweet spot — tinted, not painted' : 'noticeable but acceptable'}
          </span>
        </p>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-[0.58rem] font-semibold uppercase tracking-[0.20em] text-[var(--color-text-subtle)]">
          <span>Tint opacity</span>
          <span style={{ color: isPainted ? 'var(--color-danger)' : 'var(--color-accent-bright)' }}>{alpha.toFixed(2)}</span>
        </div>
        {/* Custom track with sweet-spot band */}
        <div className="relative h-2 overflow-hidden rounded-full" style={{ background: 'oklch(0.28 0.02 254 / 0.6)' }}>
          <div className="absolute inset-y-0 rounded-full" style={{ left: '33%', width: '22%', background: 'oklch(0.76 0.16 160 / 0.35)' }} />
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
            style={{ width: `${(alpha / 0.45) * 100}%`, background: isPainted ? 'var(--color-danger)' : 'var(--color-accent-bright)' }} />
        </div>
        <input type="range" min={0} max={0.45} step={0.01} value={alpha}
          onChange={e => setAlpha(Number(e.target.value))}
          className="relative mt-[-0.55rem] w-full cursor-pointer opacity-0" style={{ height: '0.5rem' }} />
        <div className="mt-1 flex justify-between text-[0.52rem] text-[var(--color-text-subtle)]">
          <span>0</span><span className="text-[var(--color-success)]">sweet spot ↑</span><span>0.45</span>
        </div>
      </div>
    </div>
  );
};

// Tip: text-bevel makes text legible against frosted backgrounds
const TipTextBevel: React.FC = () => {
  const [bevel, setBevel] = useState(true);
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.4rem] p-6"
        style={{ background: 'oklch(0.20 0.024 254 / 0.50)', backdropFilter: 'blur(28px)', border: '1px solid oklch(0.48 0.06 248 / 0.28)' }}>
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.42), transparent)' }} />
        <p className={`text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] ${bevel ? 'text-bevel' : ''}`}>
          Metadata label
        </p>
        <p className={`mt-1 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] ${bevel ? 'text-bevel-strong' : ''}`}>
          Snippet title
        </p>
        <p className={`mt-1.5 text-xs leading-5 text-[var(--color-text-muted)] ${bevel ? 'text-bevel' : ''}`}>
          Body copy on a frosted surface — readability matters here.
        </p>
      </div>
      <button onClick={() => setBevel(!bevel)}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition duration-200 hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]">
        {bevel ? 'Remove text-bevel' : 'Restore text-bevel'}
      </button>
    </div>
  );
};

// Tip: overflow:hidden required — glow divs are oversized by design
const TipOverflow: React.FC = () => {
  const [clipped, setClipped] = useState(true);
  return (
    <div className="space-y-3">
      <div className="relative rounded-[1.4rem] p-6" style={{ overflow: clipped ? 'hidden' : 'visible',
        background: 'oklch(0.20 0.024 254 / 0.50)', backdropFilter: 'blur(24px)', border: '1px solid oklch(0.48 0.06 248 / 0.28)' }}>
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.42), transparent)' }} />
        {/* Corner glow — intentionally oversized */}
        <div aria-hidden className="pointer-events-none absolute right-[-4rem] top-[-12rem] h-[28rem] w-[58rem] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.52 0.24 238 / 0.14) 0%, transparent 70%)', filter: 'blur(120px)' }} />
        <p className="relative z-10 text-xs font-semibold text-[var(--color-text)] text-bevel-strong">Panel</p>
        <p className="relative z-10 mt-1 text-[0.62rem] text-[var(--color-text-muted)] text-bevel">
          {clipped ? 'Glow clipped — contained within border-radius' : 'Glow bleeding — spills into surrounding layout'}
        </p>
      </div>
      <button onClick={() => setClipped(!clipped)}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition duration-200 hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]">
        {clipped ? 'Remove overflow:hidden' : 'Restore overflow:hidden'}
      </button>
    </div>
  );
};

// Tip: backdrop-filter only works with something behind it
const TipBackdropBg: React.FC = () => {
  const [hasBg, setHasBg] = useState(true);
  return (
    <div className="space-y-3">
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-[1.4rem] transition-all duration-700"
        style={{ background: hasBg
          ? `radial-gradient(circle at 18% 28%, oklch(0.42 0.24 216 / 0.50), transparent 38%), linear-gradient(135deg, oklch(0.12 0.04 248), oklch(0.08 0.03 260))`
          : 'oklch(0.22 0 0)' }}>
        <div className="relative overflow-hidden rounded-[1rem] px-5 py-3 transition-all duration-700"
          style={{ background: 'oklch(0.20 0.024 254 / 0.45)', backdropFilter: 'blur(24px)', border: `1px solid oklch(0.48 0.06 248 / ${hasBg ? '0.30' : '0.12'})` }}>
          <p className="text-[0.62rem] font-semibold text-[var(--color-text)] text-bevel-strong">{hasBg ? 'backdrop-filter works' : 'Nothing to blur'}</p>
          <p className="mt-0.5 text-[0.58rem] text-[var(--color-text-subtle)] text-bevel">{hasBg ? 'Gradient behind provides texture' : 'Flat background — effect is invisible'}</p>
        </div>
      </div>
      <button onClick={() => setHasBg(!hasBg)}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2 text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition duration-200 hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]">
        {hasBg ? 'Remove gradient backdrop' : 'Restore gradient backdrop'}
      </button>
    </div>
  );
};

// Tip: cursor tracking — light follows the mouse
const TipCursorLight: React.FC = () => {
  const [pos, setPos] = useState({ x: 70, y: 30 });
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  return (
    <div ref={ref} className="relative cursor-crosshair overflow-hidden rounded-[1.4rem] p-6 select-none" onMouseMove={onMove}
      style={{ background: 'oklch(0.20 0.024 254 / 0.50)', backdropFilter: 'blur(24px)', border: '1px solid oklch(0.48 0.06 248 / 0.28)' }}>
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.42), transparent)' }} />
      {/* Light wash */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 200% 180% at ${pos.x}% ${pos.y}%, oklch(0.28 0.06 215 / 0.22) 0%, transparent 52%)`, mixBlendMode: 'screen' }} />
      {/* Shadow */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 160% 130% at ${100 - pos.x}% ${100 - pos.y}%, oklch(0.04 0.01 255 / 0.20) 0%, transparent 55%)` }} />
      <p className="relative z-10 text-xs font-semibold text-[var(--color-text)] text-bevel-strong">Specular reflection</p>
      <p className="relative z-10 mt-1 text-[0.62rem] leading-5 text-[var(--color-text-muted)] text-bevel">
        Light follows cursor via a screen-blended radial gradient. Shadow appears on the opposite side. Both use opacity transitions — instant on hover, no jank.
      </p>
      <p className="relative z-10 mt-3 text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">Move cursor over this panel ↑</p>
    </div>
  );
};

// ── § 10 — Do's & Don'ts helpers ──────────────────────────────────────────────

type DoDontCardProps = { ok: boolean; label: string; children: React.ReactNode };
const DoDontCard: React.FC<DoDontCardProps> = ({ ok, label, children }) => (
  <div className="relative pt-4">
    <div className={`absolute left-3 top-0 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.20em] ${
      ok
        ? 'border border-[oklch(0.76_0.16_160_/_0.45)] bg-[oklch(0.76_0.16_160_/_0.12)] text-[oklch(0.76_0.16_160)]'
        : 'border border-[oklch(0.65_0.19_25_/_0.45)] bg-[oklch(0.65_0.19_25_/_0.12)] text-[oklch(0.65_0.19_25)]'
    }`}>
      {ok ? '✓' : '✗'} {label}
    </div>
    {children}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const GlassShowcase: React.FC = () => {
  const { isDawn } = useBackground();

  return (
  <div className="relative min-h-screen">

    <div
      className="mx-auto px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,6vw,5rem)]"
      style={{ maxWidth: '132rem', color: isDawn ? 'oklch(0.22 0.03 50)' : undefined }}
    >

      {/* ── Back nav ── */}
      <Link
        to="/"
        className="mb-14 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] transition duration-200"
        style={{ color: isDawn ? 'oklch(0.38 0.05 50)' : 'var(--color-text-subtle)' }}
      >
        ← Back
      </Link>

      {/* ── Hero ── */}
      <div className="mb-20">
        <p
          className="text-[0.72rem] font-semibold uppercase tracking-[0.42em]"
          style={{ color: isDawn ? 'oklch(0.45 0.06 55)' : 'var(--color-text-subtle)' }}
        >
          Design system
        </p>
        <h1
          className="mt-3 font-[var(--font-display)] text-[clamp(3.5rem,10vw,7rem)] font-[200] leading-[0.9] tracking-[-0.07em]"
          style={{ color: isDawn ? 'oklch(0.18 0.04 45)' : 'var(--color-text)' }}
        >
          Glass
        </h1>
        <p
          className="mt-5 max-w-xl text-sm leading-7"
          style={{ color: isDawn ? 'oklch(0.36 0.04 50)' : 'var(--color-text-muted)' }}
        >
          All panels draw from two master knobs —{' '}
          <code className="rounded px-1 font-[var(--font-code)] text-[0.8em] text-[var(--color-accent-bright)]">
            GLASS_OPACITY&nbsp;{GLASS_OPACITY}
          </code>{' '}
          and{' '}
          <code className="rounded px-1 font-[var(--font-code)] text-[0.8em] text-[var(--color-accent-bright)]">
            GLASS_BLUR&nbsp;{GLASS_BLUR}px
          </code>
          . Adjust those two values to retheme every surface at once.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          § 0 — Design philosophy
      ══════════════════════════════════════════════════════════════ */}
      <Section label="00 — Philosophy" sub="The principles behind every glass surface in this UI." light={isDawn}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              title: 'One light source',
              body: 'Every panel behaves as if lit from the upper-right. The top-edge shimmer line, the corner glow, and the inset box-shadow all point toward the same imaginary origin — so layering panels never creates contradictory lighting.',
            },
            {
              title: 'Background is content',
              body: 'Glass works because what\'s behind the panel is intentionally beautiful. The frosted blur turns the dark gradient and animated orbs into an abstract texture — the panel doesn\'t hide its context, it frames it.',
            },
            {
              title: 'Two knobs, infinite surface',
              body: 'GLASS_OPACITY and GLASS_BLUR are the only global controls. Every surface — cards, modals, nav bars, toasts — is a multiplier of those two values. Tune them once and the entire UI shifts in unison.',
            },
            {
              title: 'Depth through opacity',
              body: 'Panels closer to the user (modals, popovers) use "strong" intensity. Background panels use "subtle". This creates a natural focus hierarchy without resorting to drop shadows alone.',
            },
            {
              title: 'Colour as atmosphere',
              body: 'Tinted glass is not branding — it\'s emotional temperature. Blue is neutral and analytical. Amber signals caution. Emerald signals life. The tint is always applied as a screen-blend wash, never as a flat fill, so the texture stays intact.',
            },
            {
              title: 'Motion reinforces material',
              body: 'The mouse-tracking radial gradient inside each panel simulates specular reflection — the highlight follows your cursor as if light is bouncing off the surface. GSAP handles panel entrances and exits so the glass feels like it has physical weight.',
            },
          ].map(({ title, body }) => (
            <GlassPanel key={title} intensity="subtle" topGlow rounded="rounded-[1.8rem]" className="p-6">
              <p className="font-[var(--font-display)] text-base font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">{title}</p>
              <p className="mt-2.5 text-xs leading-6 text-[var(--color-text-muted)] text-bevel">{body}</p>
            </GlassPanel>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 1 — Intensity
      ══════════════════════════════════════════════════════════════ */}
      <Section label="01 — Intensity" sub="Three tiers scale against the global opacity + blur master values." light={isDawn}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(['subtle', 'medium', 'strong'] as const).map((intensity) => (
            <GlassPanel key={intensity} intensity={intensity} topGlow bottomGlow rounded="rounded-[2rem]" className="p-7">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
                {intensity}
              </p>
              <p className="mt-3 font-[var(--font-display)] text-4xl font-[200] tracking-[-0.06em] text-[var(--color-text)] text-bevel-strong">
                {intensity === 'subtle' ? 'Airy' : intensity === 'medium' ? 'Glass' : 'Dense'}
              </p>
              <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
                {intensity === 'subtle' && 'Near-transparent. Background bleeds through almost undisturbed.'}
                {intensity === 'medium' && 'The default. Enough body to read text clearly while staying luminous.'}
                {intensity === 'strong' && 'Opaque presence. Used for modals and elevated form surfaces.'}
              </p>
              <IntensityBar intensity={intensity} />
            </GlassPanel>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 2 — Tinted glass
      ══════════════════════════════════════════════════════════════ */}
      <Section label="02 — Tinted" sub="A screen-blend colour wash over the base glass — same blur and border, different hue." light={isDawn}>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          <TintedPanel label="Sapphire" sub="hue 240" tint="oklch(0.55 0.28 240)">
            <SampleContent title="Blue" body="The default palette anchor." />
          </TintedPanel>
          <TintedPanel label="Teal" sub="hue 200" tint="oklch(0.60 0.22 200)">
            <SampleContent title="Teal" body="Cool, ocean-floor calm." />
          </TintedPanel>
          <TintedPanel label="Violet" sub="hue 290" tint="oklch(0.58 0.26 290)">
            <SampleContent title="Violet" body="Deep, ceremonial weight." />
          </TintedPanel>
          <TintedPanel label="Rose" sub="hue 10" tint="oklch(0.62 0.22 10)">
            <SampleContent title="Rose" body="Warm, attention-drawing." />
          </TintedPanel>
          <TintedPanel label="Amber" sub="hue 72" tint="oklch(0.72 0.20 72)">
            <SampleContent title="Amber" body="Caution or highlight." />
          </TintedPanel>
          <TintedPanel label="Emerald" sub="hue 160" tint="oklch(0.65 0.22 160)">
            <SampleContent title="Emerald" body="Success, growth, life." />
          </TintedPanel>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 3 — Blur levels
      ══════════════════════════════════════════════════════════════ */}
      <Section label="03 — Blur" sub="Same opacity and border; only backdrop-filter changes. Current global setting shown in bold." light={isDawn}>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <BlurPanel blur={8}  label="Minimal"  sub="Barely frosted — background structure still visible." />
          <BlurPanel blur={20} label="Light"    sub="Gentle diffusion without losing the depth behind." />
          <BlurPanel blur={GLASS_BLUR} label={`Default · active`} sub={`Your current GLASS_BLUR setting.`} />
          <BlurPanel blur={72} label="Heavy"    sub="Fully frosted. Background becomes pure colour." />
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 4 — Glow combinations
      ══════════════════════════════════════════════════════════════ */}
      <Section label="04 — Ambient glow" sub="Top-right (blue) and bottom-left (teal) corner glows can be toggled independently." light={isDawn}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <GlassPanel intensity="medium" topGlow={false} bottomGlow={false} rounded="rounded-[2rem]" className="p-7">
            <GlowLabel>No glow</GlowLabel>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">Flat glass surface — useful for dense data grids where ambient light would distract.</p>
          </GlassPanel>
          <GlassPanel intensity="medium" topGlow={true} bottomGlow={false} rounded="rounded-[2rem]" className="p-7">
            <GlowLabel>Top-right only</GlowLabel>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">The default. Deep-blue wash drifts from the upper corner, mimicking a light source above.</p>
          </GlassPanel>
          <GlassPanel intensity="medium" topGlow={false} bottomGlow={true} rounded="rounded-[2rem]" className="p-7">
            <GlowLabel>Bottom-left only</GlowLabel>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">Teal counter-glow from below — adds grounding weight without the top highlight.</p>
          </GlassPanel>
          <GlassPanel intensity="medium" topGlow={true} bottomGlow={true} rounded="rounded-[2rem]" className="p-7">
            <GlowLabel>Both glows</GlowLabel>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">Blue-to-teal diagonal tension. Maximum luminosity — best for hero or showcase panels.</p>
          </GlassPanel>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 5 — Corner radius
      ══════════════════════════════════════════════════════════════ */}
      <Section label="05 — Radius" sub="The rounded prop is a Tailwind class — any value works." light={isDawn}>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { r: 'rounded-[0.5rem]', label: '8px', sub: 'Almost sharp' },
            { r: 'rounded-[1rem]',   label: '16px', sub: 'UI default' },
            { r: 'rounded-[2rem]',   label: '32px', sub: 'Soft panel' },
            { r: 'rounded-[3.5rem]', label: '56px', sub: 'Pill / blob' },
          ].map(({ r, label, sub }) => (
            <GlassPanel key={r} intensity="medium" topGlow rounded={r} className="p-7">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
                {label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">{sub}</p>
            </GlassPanel>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 6 — Nested glass (glass on glass)
      ══════════════════════════════════════════════════════════════ */}
      <Section label="06 — Nested" sub="Glass panels layered inside glass panels. Each layer adds a degree of frosted depth." light={isDawn}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Depth stack */}
          <GlassPanel intensity="subtle" topGlow bottomGlow rounded="rounded-[2rem]" className="p-6">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel mb-4">Depth stack</p>
            <GlassPanel intensity="medium" topGlow rounded="rounded-[1.4rem]" className="p-5">
              <p className="text-[0.60rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)] text-bevel mb-3">Layer 2</p>
              <GlassPanel intensity="strong" rounded="rounded-[1rem]" className="p-4">
                <p className="text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">Layer 3 · strong</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)] text-bevel">Each layer adds opacity.</p>
              </GlassPanel>
            </GlassPanel>
          </GlassPanel>

          {/* Card with glass header bar */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="overflow-hidden p-0">
            {/* Header band — stronger glass strip */}
            <div
              className="relative flex items-center justify-between px-6 py-4"
              style={{
                background: 'oklch(0.26 0.035 254 / 0.55)',
                borderBottom: '1px solid oklch(0.5 0.05 248 / 0.22)',
              }}
            >
              <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Activity</p>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[0.55rem] font-bold text-[var(--color-accent-bright)]">3</span>
            </div>
            {/* Body rows */}
            <div className="p-4 flex flex-col gap-2">
              {['Deployment successful', 'New comment on #42', 'Build passed'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5" style={{ background: 'oklch(0.22 0.028 254 / 0.38)' }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ['oklch(0.76 0.16 160)', 'oklch(0.71 0.17 244)', 'oklch(0.76 0.16 160)'][i] }} />
                  <p className="text-xs text-[var(--color-text-muted)] text-bevel">{item}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Modal-inside-panel illusion */}
          <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="relative p-6">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel mb-5">Background context</p>
            <p className="text-xs leading-5 text-[var(--color-text-muted)] text-bevel mb-5">
              Content behind the dialog stays visible through the frosting — the user never loses their place.
            </p>
            {/* Simulated elevated dialog */}
            <GlassPanel intensity="strong" topGlow rounded="rounded-[1.4rem]" className="p-5"
              style={{ boxShadow: '0 16px 56px oklch(0.05 0.015 250 / 0.64), inset 0 1px 0 oklch(0.8 0.1 230 / 0.22)' }}
            >
              <p className="text-[0.60rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)] text-bevel">Confirm action</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">This will permanently remove the item.</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Cancel</button>
                <button className="rounded-full border border-[oklch(0.65_0.19_25_/_0.5)] bg-[oklch(0.65_0.19_25_/_0.18)] px-3 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.18em] text-[oklch(0.82_0.12_20)]">Delete</button>
              </div>
            </GlassPanel>
          </GlassPanel>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 7 — Component patterns
      ══════════════════════════════════════════════════════════════ */}
      <Section label="07 — Components" sub="Common UI patterns rendered in glass — profile, metrics, media, navigation." light={isDawn}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Profile card */}
          <GlassPanel intensity="medium" topGlow bottomGlow rounded="rounded-[2rem]" className="p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-[300] text-[var(--color-text)]"
                style={{ background: 'linear-gradient(135deg, oklch(0.38 0.12 240 / 0.7), oklch(0.30 0.10 260 / 0.6))', border: '1px solid oklch(0.5 0.08 248 / 0.4)' }}>
                AK
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[oklch(0.20_0.025_254)] bg-[oklch(0.76_0.16_160)]" />
            </div>
            <p className="font-[var(--font-display)] text-base font-[400] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">Alex K.</p>
            <p className="mt-0.5 text-[0.65rem] text-[var(--color-text-subtle)] text-bevel uppercase tracking-[0.18em]">Design Engineer</p>
            <div className="mt-4 flex gap-1.5">
              {['Follow', 'Message'].map((lbl, i) => (
                <button key={lbl} className="rounded-full px-3.5 py-1.5 text-[0.60rem] font-semibold uppercase tracking-[0.18em] transition duration-200"
                  style={i === 0
                    ? { background: 'oklch(0.71 0.17 244 / 0.22)', border: '1px solid oklch(0.71 0.17 244 / 0.4)', color: 'oklch(0.82 0.10 230)' }
                    : { background: 'oklch(0.22 0.028 254 / 0.5)', border: '1px solid oklch(0.4 0.044 248 / 0.38)', color: 'var(--color-text-muted)' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Metric cards */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-6 flex flex-col gap-4">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Dashboard</p>
            {[
              { label: 'Snippets', value: '248', trend: '+12', up: true },
              { label: 'Views',    value: '18.4k', trend: '+8%', up: true },
              { label: 'Errors',   value: '3',    trend: '+3',  up: false },
            ].map(({ label, value, trend, up }) => (
              <div key={label} className="flex items-end justify-between">
                <div>
                  <p className="text-[0.60rem] text-[var(--color-text-subtle)] text-bevel uppercase tracking-[0.16em]">{label}</p>
                  <p className="mt-0.5 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">{value}</p>
                </div>
                <span className="mb-0.5 text-[0.65rem] font-semibold" style={{ color: up ? 'oklch(0.76 0.16 160)' : 'oklch(0.65 0.19 25)' }}>{trend}</span>
              </div>
            ))}
          </GlassPanel>

          {/* Media / now-playing card */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-6">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel mb-4">Now playing</p>
            {/* Album art placeholder */}
            <div className="mx-auto mb-4 h-24 w-24 rounded-[1rem] flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, oklch(0.32 0.14 250), oklch(0.24 0.10 280))', border: '1px solid oklch(0.4 0.08 252 / 0.4)' }}>
              ♪
            </div>
            <p className="text-center font-[var(--font-display)] text-base font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">Glass Structures</p>
            <p className="mt-0.5 text-center text-[0.65rem] text-[var(--color-text-subtle)] text-bevel">Ambient · 4:12</p>
            {/* Progress bar */}
            <div className="mt-4 h-1 w-full rounded-full bg-[var(--color-border)]">
              <div className="h-1 w-[38%] rounded-full bg-[var(--color-accent-bright)] opacity-70" />
            </div>
            {/* Controls */}
            <div className="mt-4 flex justify-center gap-5 text-[var(--color-text-muted)]">
              {['⏮', '⏸', '⏭'].map((icon, i) => (
                <button key={i} className="text-lg transition duration-200 hover:text-[var(--color-text)]"
                  style={i === 1 ? { color: 'var(--color-text)', transform: 'scale(1.2)' } : undefined}>{icon}</button>
              ))}
            </div>
          </GlassPanel>

          {/* Notification stack */}
          <div className="relative flex flex-col gap-3">
            {[
              { icon: '✓', title: 'Deploy succeeded', body: 'main → production', color: 'oklch(0.76 0.16 160)', bg: 'oklch(0.76 0.16 160 / 0.12)', border: 'oklch(0.76 0.16 160 / 0.35)' },
              { icon: '!', title: 'High memory usage', body: 'Instance i-4f2a · 91%', color: 'oklch(0.80 0.13 88)', bg: 'oklch(0.80 0.13 88 / 0.10)', border: 'oklch(0.80 0.13 88 / 0.32)' },
              { icon: '↑', title: 'New version ready', body: 'v2.4.1 available', color: 'oklch(0.71 0.17 244)', bg: 'oklch(0.71 0.17 244 / 0.10)', border: 'oklch(0.71 0.17 244 / 0.32)' },
            ].map(({ icon, title, body, color, bg, border }) => (
              <GlassPanel key={title} intensity="medium" topGlow={false} rounded="rounded-[1.4rem]" className="flex items-start gap-3 p-4"
                style={{ borderColor: border, background: bg, backdropFilter: 'blur(24px)' }}>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `${color.replace(')', ' / 0.18)')}`, color }}>{icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text)] text-bevel">{title}</p>
                  <p className="mt-0.5 text-[0.65rem] text-[var(--color-text-subtle)] text-bevel truncate">{body}</p>
                </div>
              </GlassPanel>
            ))}
          </div>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 8 — Navigation patterns
      ══════════════════════════════════════════════════════════════ */}
      <Section label="08 — Navigation" sub="Bars, tabs, and breadcrumbs — all common surfaces where glass reinforces hierarchy." light={isDawn}>
        <div className="flex flex-col gap-6">

          {/* Glass nav bar */}
          <div className="flex items-center justify-between gap-4 rounded-[1.8rem] px-6 py-3.5"
            style={{ background: 'oklch(0.20 0.025 254 / 0.62)', backdropFilter: 'blur(32px)', border: '1px solid oklch(0.4 0.044 248 / 0.32)', boxShadow: '0 4px 32px oklch(0.05 0.015 250 / 0.36)' }}>
            <span className="font-[var(--font-display)] text-sm font-[300] tracking-[-0.03em] text-[var(--color-text)] text-bevel-strong">Snippets</span>
            <div className="flex items-center gap-1">
              {['Archive', 'Explore', 'Docs', 'Settings'].map((item, i) => (
                <button key={item} className="rounded-full px-4 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition duration-200"
                  style={i === 0
                    ? { background: 'oklch(0.28 0.04 252 / 0.7)', color: 'var(--color-text)' }
                    : { color: 'var(--color-text-subtle)' }}>
                  {item}
                </button>
              ))}
            </div>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'oklch(0.32 0.10 244 / 0.5)', color: 'var(--color-accent-bright)', border: '1px solid oklch(0.5 0.08 244 / 0.4)' }}>
              AK
            </div>
          </div>

          {/* Tab bar + breadcrumb row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Segmented tabs */}
            <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-4">
              <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Segmented control</p>
              <div className="flex gap-1 rounded-[1.2rem] p-1" style={{ background: 'oklch(0.16 0.020 256 / 0.5)' }}>
                {['All', 'Javascript', 'Python', 'Go'].map((tab, i) => (
                  <button key={tab} className="flex-1 rounded-[0.9rem] px-3 py-2 text-[0.60rem] font-semibold uppercase tracking-[0.16em] transition duration-200"
                    style={i === 0
                      ? { background: 'oklch(0.27 0.038 253 / 0.9)', color: 'var(--color-text)', boxShadow: '0 2px 8px oklch(0.05 0.015 250 / 0.36)' }
                      : { color: 'var(--color-text-subtle)' }}>
                    {tab}
                  </button>
                ))}
              </div>
            </GlassPanel>

            {/* Breadcrumb + pill tags */}
            <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-4 flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Breadcrumb</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Archive', 'Javascript', 'fetch-utils.ts'].map((crumb, i, arr) => (
                    <React.Fragment key={crumb}>
                      <span className="text-[0.65rem] text-[i < arr.length - 1 ? 'var(--color-text-subtle)' : 'var(--color-text)'] text-bevel"
                        style={{ color: i < arr.length - 1 ? 'var(--color-text-subtle)' : 'var(--color-text)' }}>{crumb}</span>
                      {i < arr.length - 1 && <span className="text-[0.60rem] text-[var(--color-text-subtle)]">/</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2.5 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'typescript', color: 'oklch(0.71 0.17 244)' },
                    { label: 'async',      color: 'oklch(0.65 0.22 160)' },
                    { label: 'http',       color: 'oklch(0.72 0.18 290)' },
                    { label: 'utility',    color: 'oklch(0.80 0.13 88)' },
                  ].map(({ label, color }) => (
                    <span key={label} className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em]"
                      style={{ background: `${color.replace(')', ' / 0.14)')}`, border: `1px solid ${color.replace(')', ' / 0.32)')}`, color }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 9 — Form & Input patterns
      ══════════════════════════════════════════════════════════════ */}
      <Section
        label="09 — Forms & Inputs"
        sub="Form controls are glass surfaces too. Fields, toggles, and sliders should feel like they belong in the same light field as the panels behind them — not imported from a different design language."
        light={isDawn}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Left: annotated field anatomy */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-7 flex flex-col gap-6">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Field anatomy</p>

            {/* Text input */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)] text-bevel">Title</label>
              <div className="relative">
                <input
                  readOnly
                  value="Glass Design System"
                  className="w-full rounded-[0.9rem] px-4 py-3 text-sm text-[var(--color-text)] outline-none"
                  style={{
                    background: 'oklch(0.16 0.020 256 / 0.55)',
                    border: '1px solid oklch(0.48 0.06 248 / 0.32)',
                    boxShadow: 'inset 0 1px 0 oklch(0.82 0.1 230 / 0.07)',
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[0.9rem]"
                  style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.18), transparent)' }} />
              </div>
              <p className="text-[0.60rem] text-[var(--color-text-subtle)] text-bevel">Same background base as panels — slightly darker, no blur needed inside a glass surface.</p>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)] text-bevel">Description</label>
              <textarea
                readOnly
                value={"A system built around a single\nlight source. Every surface\nresponds to the same field."}
                rows={3}
                className="w-full resize-none rounded-[0.9rem] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none"
                style={{
                  background: 'oklch(0.16 0.020 256 / 0.55)',
                  border: '1px solid oklch(0.48 0.06 248 / 0.32)',
                  boxShadow: 'inset 0 1px 0 oklch(0.82 0.1 230 / 0.07)',
                }}
              />
            </div>

            {/* Select / dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)] text-bevel">Language</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-[0.9rem] px-4 py-3 text-sm text-[var(--color-text)] outline-none"
                  style={{
                    background: 'oklch(0.16 0.020 256 / 0.55)',
                    border: '1px solid oklch(0.48 0.06 248 / 0.32)',
                    boxShadow: 'inset 0 1px 0 oklch(0.82 0.1 230 / 0.07)',
                  }}
                  defaultValue="typescript"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.60rem] text-[var(--color-text-subtle)]">▾</span>
              </div>
            </div>
          </GlassPanel>

          {/* Right: toggles, sliders, a complete form */}
          <div className="flex flex-col gap-6">

            {/* Toggle switches */}
            <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="p-6 flex flex-col gap-5">
              <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Toggles &amp; controls</p>
              {([
                { label: 'Line numbers', on: true },
                { label: 'Auto-size cards', on: false },
                { label: 'Background animation', on: true },
              ] as { label: string; on: boolean }[]).map(({ label, on }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)] text-bevel">{label}</span>
                  <div className="relative h-5 w-9 rounded-full transition duration-300 cursor-pointer"
                    style={{
                      background: on ? 'oklch(0.62 0.17 240 / 0.55)' : 'oklch(0.22 0.025 254 / 0.6)',
                      border: `1px solid ${on ? 'oklch(0.62 0.17 240 / 0.6)' : 'oklch(0.40 0.044 248 / 0.38)'}`,
                    }}>
                    <div className="absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300 shadow-sm"
                      style={{
                        left: on ? '18px' : '2px',
                        background: on ? 'oklch(0.88 0.08 230)' : 'oklch(0.50 0.06 248)',
                        boxShadow: on ? '0 1px 4px oklch(0.62 0.17 240 / 0.5)' : 'none',
                      }} />
                  </div>
                </div>
              ))}
              <p className="text-[0.60rem] text-[var(--color-text-subtle)] text-bevel mt-1">Track uses the accent hue at low opacity — the thumb brightens when active to simulate light catching it.</p>
            </GlassPanel>

            {/* Range sliders */}
            <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="p-6 flex flex-col gap-5">
              <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Range sliders</p>
              {([
                { label: 'Opacity', value: 66, unit: '%', color: 'oklch(0.62 0.17 240)' },
                { label: 'Blur',    value: 40, unit: 'px', color: 'oklch(0.65 0.14 210)' },
              ] as { label: string; value: number; unit: string; color: string }[]).map(({ label, value, unit, color }) => (
                <div key={label} className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">{label}</span>
                    <span className="font-[var(--font-code)] text-[0.62rem]" style={{ color }}>{value}{unit}</span>
                  </div>
                  <div className="relative h-1.5 w-full rounded-full" style={{ background: 'oklch(0.22 0.025 254 / 0.7)' }}>
                    <div className="absolute left-0 top-0 h-1.5 rounded-full" style={{ width: `${value}%`, background: `${color.replace(')', ' / 0.7)')}` }} />
                    <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full shadow"
                      style={{ left: `calc(${value}% - 7px)`, background: 'oklch(0.84 0.08 228)', boxShadow: `0 1px 6px ${color.replace(')', ' / 0.55)')}` }} />
                  </div>
                </div>
              ))}
              <p className="text-[0.60rem] text-[var(--color-text-subtle)] text-bevel mt-1">Track fill and thumb glow use the same hue as the value it controls — opacity knob is blue, blur knob is teal. Colour carries meaning.</p>
            </GlassPanel>

          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 10 — Code & Terminal
      ══════════════════════════════════════════════════════════════ */}
      <Section
        label="10 — Code & Terminal"
        sub="Code blocks are the reason glass exists in this system. The frosted surface puts distance between the syntax-highlighted content and the ambient background, letting colour and contrast carry meaning without competing with the environment."
        light={isDawn}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Terminal window */}
          <GlassPanel intensity="strong" topGlow bottomGlow rounded="rounded-[2rem]" className="overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-3 border-b px-5 py-3.5"
              style={{ borderColor: 'oklch(0.48 0.06 248 / 0.22)' }}>
              <div className="flex gap-1.5">
                {['oklch(0.65 0.19 25)', 'oklch(0.80 0.13 88)', 'oklch(0.72 0.18 160)'].map((c) => (
                  <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                ))}
              </div>
              <span className="flex-1 text-center font-[var(--font-code)] text-[0.60rem] text-[var(--color-text-subtle)]">~/snippets</span>
            </div>
            {/* Content */}
            <div className="p-6 font-[var(--font-code)] text-[0.72rem] leading-6 space-y-1.5">
              {[
                { prompt: true,  text: 'npm run build',                                   color: 'var(--color-text)' },
                { prompt: false, text: '  vite v5.4.2 building for production…',          color: 'var(--color-text-muted)' },
                { prompt: false, text: '  ✓  1,847 modules transformed.',                 color: 'oklch(0.72 0.18 160)' },
                { prompt: false, text: '  dist/index.html         0.48 kB',               color: 'var(--color-text-muted)' },
                { prompt: false, text: '  dist/assets/index.js  284.20 kB │ gz: 89 kB',  color: 'var(--color-text-muted)' },
                { prompt: false, text: '  ✓  built in 2.34s',                             color: 'oklch(0.72 0.18 160)' },
                { prompt: true,  text: 'git push origin main',                            color: 'var(--color-text)' },
                { prompt: false, text: '  → Deployed to production.',                     color: 'oklch(0.62 0.17 240)' },
              ].map(({ prompt, text, color }, i) => (
                <div key={i} className="flex gap-2">
                  {prompt
                    ? <span style={{ color: 'oklch(0.72 0.18 160)' }}>❯</span>
                    : <span className="w-3 shrink-0" />
                  }
                  <span style={{ color }}>{text}</span>
                </div>
              ))}
              <div className="flex gap-2 opacity-70">
                <span style={{ color: 'oklch(0.72 0.18 160)' }}>❯</span>
                <span className="w-2 h-4 inline-block rounded-sm animate-pulse" style={{ background: 'var(--color-text-muted)' }} />
              </div>
            </div>
          </GlassPanel>

          {/* Code block patterns */}
          <div className="flex flex-col gap-6">

            {/* Inline code block */}
            <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Code block</p>
                <span className="rounded-full px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em]"
                  style={{ background: 'oklch(0.62 0.17 240 / 0.14)', border: '1px solid oklch(0.62 0.17 240 / 0.30)', color: 'oklch(0.71 0.14 232)' }}>
                  TypeScript
                </span>
              </div>
              <div className="rounded-[1.2rem] p-4 font-[var(--font-code)] text-[0.72rem] leading-6 overflow-hidden"
                style={{ background: 'oklch(0.12 0.018 255 / 0.7)', border: '1px solid oklch(0.36 0.044 250 / 0.28)' }}>
                <div><span style={{ color: 'oklch(0.74 0.14 290)' }}>export function </span><span style={{ color: 'oklch(0.78 0.16 200)' }}>getGlassStyles</span><span style={{ color: 'var(--color-text-muted)' }}>(</span></div>
                <div><span style={{ color: 'oklch(0.80 0.10 60)' }}>  intensity</span><span style={{ color: 'var(--color-text-muted)' }}>: </span><span style={{ color: 'oklch(0.72 0.16 38)' }}>GlassIntensity </span><span style={{ color: 'var(--color-text-muted)' }}>= </span><span style={{ color: 'oklch(0.72 0.18 160)' }}>'medium'</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>): </span><span style={{ color: 'oklch(0.72 0.16 38)' }}>GlassStyles </span><span style={{ color: 'var(--color-text-muted)' }}>{'{'}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>  return {'{'}</span></div>
                <div><span style={{ color: 'oklch(0.80 0.10 60)' }}>    panel</span><span style={{ color: 'var(--color-text-muted)' }}>: getPanel(intensity),</span></div>
                <div><span style={{ color: 'oklch(0.80 0.10 60)' }}>    shimmerColor</span><span style={{ color: 'var(--color-text-muted)' }}>: getShimmer(intensity),</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>  {'}'};</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>{'}'}</span></div>
              </div>
              <p className="text-[0.60rem] text-[var(--color-text-subtle)] text-bevel">The code panel sits on a darker base than the card behind it — two glass layers, each with its own depth. The gap between them reads as distance.</p>
            </GlassPanel>

            {/* Diff / patch view */}
            <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="p-6 flex flex-col gap-3">
              <p className="text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Diff view — coloured glass rows</p>
              <div className="rounded-[1.2rem] overflow-hidden font-[var(--font-code)] text-[0.72rem] leading-6"
                style={{ border: '1px solid oklch(0.36 0.044 250 / 0.28)' }}>
                {([
                  { type: 'ctx', text: '  const blur  = GLASS_BLUR;' },
                  { type: 'del', text: '- const alpha = 0.42;' },
                  { type: 'add', text: '+ const alpha = GLASS_OPACITY * 0.64;' },
                  { type: 'ctx', text: '  return { backdropFilter: `blur(${blur}px)` };' },
                ] as { type: 'ctx' | 'del' | 'add'; text: string }[]).map(({ type, text }, i) => (
                  <div key={i} className="px-4 py-1.5"
                    style={{
                      background: type === 'add' ? 'oklch(0.72 0.18 160 / 0.10)' : type === 'del' ? 'oklch(0.65 0.19 25 / 0.10)' : 'transparent',
                      borderLeft: `2px solid ${type === 'add' ? 'oklch(0.72 0.18 160 / 0.6)' : type === 'del' ? 'oklch(0.65 0.19 25 / 0.6)' : 'transparent'}`,
                      color: type === 'add' ? 'oklch(0.80 0.16 160)' : type === 'del' ? 'oklch(0.72 0.16 25)' : 'var(--color-text-muted)',
                    }}>
                    {text}
                  </div>
                ))}
              </div>
              <p className="text-[0.60rem] text-[var(--color-text-subtle)] text-bevel">Diff rows use very low-opacity colour fills — green/red at ~10% — with a 2px left accent. The glass surface beneath shows through, keeping context rows readable.</p>
            </GlassPanel>

          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 11 — Tips & Tricks
      ══════════════════════════════════════════════════════════════ */}
      <Section label="11 — Tips & Tricks" sub="Interactive demonstrations of the techniques that make glass feel alive." light={isDawn}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-1 font-[var(--font-code)] text-[0.58rem] text-[var(--color-accent-bright)]">tip 01</p>
            <p className="mb-4 font-[var(--font-display)] text-sm font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">
              The 1 px shimmer line
            </p>
            <TipShimmer />
            <p className="mt-4 text-[0.60rem] leading-5 text-[var(--color-text-subtle)] text-bevel">
              A single-pixel gradient at <code className="text-[var(--color-accent-bright)]">top: 0</code> simulates light catching the glass rim. Without it, the panel reads as a flat rectangle. Always use <code className="text-[var(--color-accent-bright)]">linear-gradient(90deg, transparent, shimmerColor, transparent)</code> so the ends fade away naturally.
            </p>
          </GlassPanel>

          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-1 font-[var(--font-code)] text-[0.58rem] text-[var(--color-accent-bright)]">tip 02</p>
            <p className="mb-4 font-[var(--font-display)] text-sm font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">
              Tint opacity sweet spot
            </p>
            <TipTintRange />
            <p className="mt-4 text-[0.60rem] leading-5 text-[var(--color-text-subtle)] text-bevel">
              Keep screen-blend tints between <code className="text-[var(--color-accent-bright)]">0.14–0.22</code>. The green band on the track marks the range. Below it the tint is invisible; above it the texture is lost and the panel looks painted.
            </p>
          </GlassPanel>

          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-1 font-[var(--font-code)] text-[0.58rem] text-[var(--color-accent-bright)]">tip 03</p>
            <p className="mb-4 font-[var(--font-display)] text-sm font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">
              text-bevel on all glass text
            </p>
            <TipTextBevel />
            <p className="mt-4 text-[0.60rem] leading-5 text-[var(--color-text-subtle)] text-bevel">
              <code className="text-[var(--color-accent-bright)]">text-bevel</code> adds a 1 px drop-shadow below and a subtle white counter-shadow above. On frosted surfaces the difference is significant — especially for small labels. Use <code className="text-[var(--color-accent-bright)]">text-bevel-strong</code> on headings.
            </p>
          </GlassPanel>

          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-1 font-[var(--font-code)] text-[0.58rem] text-[var(--color-accent-bright)]">tip 04</p>
            <p className="mb-4 font-[var(--font-display)] text-sm font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">
              overflow:hidden is not optional
            </p>
            <TipOverflow />
            <p className="mt-4 text-[0.60rem] leading-5 text-[var(--color-text-subtle)] text-bevel">
              Corner glow divs are intentionally oversized — the top-right glow is <code className="text-[var(--color-accent-bright)]">28rem × 58rem</code>. Without <code className="text-[var(--color-accent-bright)]">overflow:hidden</code> they bleed into surrounding layout. GlassPanel adds it automatically; the manual pattern requires it explicitly.
            </p>
          </GlassPanel>

          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-1 font-[var(--font-code)] text-[0.58rem] text-[var(--color-accent-bright)]">tip 05</p>
            <p className="mb-4 font-[var(--font-display)] text-sm font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">
              backdrop-filter needs a backdrop
            </p>
            <TipBackdropBg />
            <p className="mt-4 text-[0.60rem] leading-5 text-[var(--color-text-subtle)] text-bevel">
              <code className="text-[var(--color-accent-bright)]">backdrop-filter: blur()</code> blurs what exists <em>behind</em> the element. On a flat solid background there is nothing to blur. The effect requires a rich gradient or image behind it — this is why <code className="text-[var(--color-accent-bright)]">background-attachment: fixed</code> on the body is essential.
            </p>
          </GlassPanel>

          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-1 font-[var(--font-code)] text-[0.58rem] text-[var(--color-accent-bright)]">tip 06</p>
            <p className="mb-4 font-[var(--font-display)] text-sm font-[300] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong">
              Specular reflection via cursor tracking
            </p>
            <TipCursorLight />
            <p className="mt-4 text-[0.60rem] leading-5 text-[var(--color-text-subtle)] text-bevel">
              Track cursor position as a percentage of the panel's bounding rect. Feed it into a <code className="text-[var(--color-accent-bright)]">radial-gradient(at X% Y%)</code> with <code className="text-[var(--color-accent-bright)]">mix-blend-mode: screen</code>. Invert the coordinates for the shadow. Both are <code className="text-[var(--color-accent-bright)]">opacity: 0</code> at rest, fading in on hover — no jump when the cursor first enters.
            </p>
          </GlassPanel>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 10 — Do's & Don'ts
      ══════════════════════════════════════════════════════════════ */}
      <Section label="12 — Do's & Don'ts" sub="Side-by-side comparisons of correct and incorrect usage patterns." light={isDawn}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

          {/* 1 — Background */}
          <div>
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Background</p>
            <div className="grid grid-cols-2 gap-3">
              <DoDontCard ok label="Rich gradient">
                <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-[1.4rem]"
                  style={{ background: 'radial-gradient(circle at 20% 30%, oklch(0.42 0.24 216 / 0.5), transparent 40%), linear-gradient(135deg, oklch(0.12 0.04 248), oklch(0.08 0.03 260))' }}>
                  <div className="relative overflow-hidden rounded-[0.8rem] px-3 py-2"
                    style={{ background: 'oklch(0.20 0.024 254 / 0.45)', backdropFilter: 'blur(20px)', border: '1px solid oklch(0.48 0.06 248 / 0.28)' }}>
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.45), transparent)' }} />
                    <p className="text-[0.58rem] text-[var(--color-text)] text-bevel-strong">Glass panel</p>
                  </div>
                </div>
              </DoDontCard>
              <DoDontCard ok={false} label="Flat colour">
                <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-[1.4rem]" style={{ background: 'oklch(0.24 0 0)' }}>
                  <div className="relative overflow-hidden rounded-[0.8rem] px-3 py-2"
                    style={{ background: 'oklch(0.20 0.024 254 / 0.45)', backdropFilter: 'blur(20px)', border: '1px solid oklch(0.48 0.06 248 / 0.10)' }}>
                    <p className="text-[0.58rem] text-[var(--color-text-subtle)] text-bevel">Invisible effect</p>
                  </div>
                </div>
              </DoDontCard>
            </div>
          </div>

          {/* 2 — Tint opacity */}
          <div>
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Tint opacity</p>
            <div className="grid grid-cols-2 gap-3">
              <DoDontCard ok label="0.18 screen blend">
                <GlassPanel intensity="medium" rounded="rounded-[1.4rem]" className="relative h-28 overflow-hidden">
                  <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'oklch(0.58 0.26 290)', mixBlendMode: 'screen', opacity: 0.18 }} />
                  <div className="flex h-full flex-col justify-end p-4">
                    <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Tinted glass</p>
                    <p className="text-[0.55rem] text-[var(--color-text-subtle)] text-bevel">Texture intact</p>
                  </div>
                </GlassPanel>
              </DoDontCard>
              <DoDontCard ok={false} label="0.55 — painted">
                <GlassPanel intensity="medium" rounded="rounded-[1.4rem]" className="relative h-28 overflow-hidden">
                  <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'oklch(0.58 0.26 290)', mixBlendMode: 'screen', opacity: 0.55 }} />
                  <div className="flex h-full flex-col justify-end p-4">
                    <p className="text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Over-tinted</p>
                    <p className="text-[0.55rem] text-[var(--color-text-subtle)] text-bevel">Texture is gone</p>
                  </div>
                </GlassPanel>
              </DoDontCard>
            </div>
          </div>

          {/* 3 — Nesting order */}
          <div>
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Nesting intensity</p>
            <div className="grid grid-cols-2 gap-3">
              <DoDontCard ok label="Step up: subtle→strong">
                <GlassPanel intensity="subtle" rounded="rounded-[1.4rem]" className="h-28 p-3">
                  <GlassPanel intensity="medium" rounded="rounded-[1rem]" className="h-full p-2.5">
                    <GlassPanel intensity="strong" rounded="rounded-[0.7rem]" className="h-full flex items-center justify-center">
                      <p className="text-[0.55rem] text-[var(--color-text-subtle)] text-bevel">Deepest</p>
                    </GlassPanel>
                  </GlassPanel>
                </GlassPanel>
              </DoDontCard>
              <DoDontCard ok={false} label="Same intensity">
                <GlassPanel intensity="strong" rounded="rounded-[1.4rem]" className="h-28 p-3">
                  <GlassPanel intensity="strong" rounded="rounded-[1rem]" className="h-full p-2.5">
                    <GlassPanel intensity="strong" rounded="rounded-[0.7rem]" className="h-full flex items-center justify-center">
                      <p className="text-[0.55rem] text-[var(--color-text-subtle)] text-bevel">No depth</p>
                    </GlassPanel>
                  </GlassPanel>
                </GlassPanel>
              </DoDontCard>
            </div>
          </div>

          {/* 4 — text-bevel */}
          <div>
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Text legibility</p>
            <div className="grid grid-cols-2 gap-3">
              <DoDontCard ok label="text-bevel applied">
                <GlassPanel intensity="medium" rounded="rounded-[1.4rem]" className="h-28 p-4 flex flex-col justify-center gap-1">
                  <p className="text-[0.55rem] uppercase tracking-[0.24em] text-[var(--color-text-subtle)] text-bevel">Label</p>
                  <p className="font-[var(--font-display)] text-lg font-[200] text-[var(--color-text)] text-bevel-strong">Heading</p>
                  <p className="text-[0.62rem] text-[var(--color-text-muted)] text-bevel">Body copy here</p>
                </GlassPanel>
              </DoDontCard>
              <DoDontCard ok={false} label="No bevel — flat text">
                <GlassPanel intensity="medium" rounded="rounded-[1.4rem]" className="h-28 p-4 flex flex-col justify-center gap-1">
                  <p className="text-[0.55rem] uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">Label</p>
                  <p className="font-[var(--font-display)] text-lg font-[200] text-[var(--color-text)]">Heading</p>
                  <p className="text-[0.62rem] text-[var(--color-text-muted)]">Body copy here</p>
                </GlassPanel>
              </DoDontCard>
            </div>
          </div>

          {/* 5 — Border-radius consistency */}
          <div>
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Nested border-radius</p>
            <div className="grid grid-cols-2 gap-3">
              <DoDontCard ok label="Smaller radius inward">
                <GlassPanel intensity="subtle" rounded="rounded-[1.6rem]" className="h-28 p-3">
                  <GlassPanel intensity="medium" rounded="rounded-[1.1rem]" className="h-full flex items-center justify-center">
                    <p className="text-[0.58rem] text-[var(--color-text-subtle)] text-bevel">Inner panel</p>
                  </GlassPanel>
                </GlassPanel>
              </DoDontCard>
              <DoDontCard ok={false} label="Same or larger radius">
                <GlassPanel intensity="subtle" rounded="rounded-[1.6rem]" className="h-28 p-3">
                  <GlassPanel intensity="medium" rounded="rounded-[1.8rem]" className="h-full flex items-center justify-center">
                    <p className="text-[0.58rem] text-[var(--color-text-subtle)] text-bevel">Corners escape</p>
                  </GlassPanel>
                </GlassPanel>
              </DoDontCard>
            </div>
          </div>

          {/* 6 — Tint blend mode */}
          <div>
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">Colour blend mode</p>
            <div className="grid grid-cols-2 gap-3">
              <DoDontCard ok label="screen — tinted glass">
                <GlassPanel intensity="medium" rounded="rounded-[1.4rem]" className="relative h-28 overflow-hidden flex items-center justify-center">
                  <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'oklch(0.65 0.22 160)', mixBlendMode: 'screen', opacity: 0.18 }} />
                  <p className="relative z-10 text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Translucent tint</p>
                </GlassPanel>
              </DoDontCard>
              <DoDontCard ok={false} label="normal — painted">
                <GlassPanel intensity="medium" rounded="rounded-[1.4rem]" className="relative h-28 overflow-hidden flex items-center justify-center">
                  <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'oklch(0.65 0.22 160 / 0.55)' }} />
                  <p className="relative z-10 text-[0.60rem] font-semibold text-[var(--color-text)] text-bevel-strong">Opaque fill</p>
                </GlassPanel>
              </DoDontCard>
            </div>
          </div>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 11 — Quick reference
      ══════════════════════════════════════════════════════════════ */}
      <Section label="13 — Quick reference" sub="The values, utilities, and rules you reach for most often." light={isDawn}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* Master knobs */}
          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Master knobs · glass.ts</p>
            <div className="space-y-2.5">
              {[
                { k: 'GLASS_OPACITY', v: '0.66', note: 'background alpha multiplier' },
                { k: 'GLASS_BLUR', v: '40px', note: 'backdrop-filter amount' },
                { k: 'GLASS_LIGHT_ALPHA', v: '0.22', note: 'specular wash on hover' },
                { k: 'GLASS_SHADOW_ALPHA', v: '0.20', note: 'far-side shadow on hover' },
              ].map(({ k, v, note }) => (
                <div key={k} className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-[var(--font-code)] text-[0.68rem] text-[var(--color-accent-bright)]">{k}</p>
                    <p className="text-[0.58rem] text-[var(--color-text-subtle)] text-bevel">{note}</p>
                  </div>
                  <span className="shrink-0 font-[var(--font-code)] text-[0.68rem] text-[var(--color-text-muted)]">{v}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Intensity alphas */}
          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Intensity base alphas</p>
            <div className="space-y-2">
              {[
                { label: 'subtle',  bg: '0.17', border: '0.20', shimmer: '0.24' },
                { label: 'medium',  bg: '0.30', border: '0.32', shimmer: '0.38' },
                { label: 'strong',  bg: '0.64', border: '0.44', shimmer: '0.64' },
              ].map(({ label, bg, border, shimmer }) => (
                <div key={label} className="rounded-[0.8rem] border border-[var(--color-border)] px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] text-bevel">{label}</span>
                  </div>
                  <div className="mt-1.5 flex gap-3 text-[0.56rem] text-[var(--color-text-subtle)] text-bevel">
                    <span>bg <code className="font-[var(--font-code)] text-[var(--color-accent-bright)]">{bg}</code></span>
                    <span>border <code className="font-[var(--font-code)] text-[var(--color-accent-bright)]">{border}</code></span>
                    <span>shimmer <code className="font-[var(--font-code)] text-[var(--color-accent-bright)]">{shimmer}</code></span>
                  </div>
                </div>
              ))}
              <p className="pt-1 text-[0.56rem] leading-4 text-[var(--color-text-subtle)] text-bevel">
                All multiplied by <code className="font-[var(--font-code)] text-[var(--color-accent-bright)]">GLASS_OPACITY</code> at runtime.
              </p>
            </div>
          </GlassPanel>

          {/* Rules & colour tokens */}
          <GlassPanel intensity="subtle" rounded="rounded-[1.8rem]" className="p-6">
            <p className="mb-4 text-[0.60rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">Rules to live by</p>
            <ul className="space-y-2.5">
              {[
                { rule: 'overflow:hidden on every panel', why: 'Glow divs are oversized by design' },
                { rule: 'background-attachment: fixed on body', why: 'Light field must stay stationary' },
                { rule: 'text-bevel / text-bevel-strong on text', why: 'Microcontrast aids legibility' },
                { rule: 'Tint at 0.14–0.22 with screen blend', why: 'Above 0.22 texture is lost' },
                { rule: 'Step intensity up when nesting', why: 'Depth needs progressive contrast' },
                { rule: 'backdrop-filter + background together', why: 'BD-filter needs something behind it' },
              ].map(({ rule, why }) => (
                <li key={rule} className="border-b border-[var(--color-border)] pb-2.5 last:border-0 last:pb-0">
                  <p className="text-[0.62rem] font-semibold text-[var(--color-text)] text-bevel">{rule}</p>
                  <p className="mt-0.5 text-[0.56rem] text-[var(--color-text-subtle)] text-bevel">{why}</p>
                </li>
              ))}
            </ul>
          </GlassPanel>

        </div>
      </Section>

    </div>
  </div>
  );
};

// ── Small layout helpers ──────────────────────────────────────────────────────

const Section: React.FC<React.PropsWithChildren<{ label: string; sub: string; light?: boolean }>> = ({ label, sub, light, children }) => (
  <section className="mb-20">
    <div className="mb-7">
      <p
        className="text-[0.68rem] font-semibold uppercase tracking-[0.34em]"
        style={{ color: light ? 'oklch(0.45 0.06 55)' : 'var(--color-text-subtle)' }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-sm"
        style={{ color: light ? 'oklch(0.36 0.04 50)' : 'var(--color-text-muted)' }}
      >
        {sub}
      </p>
    </div>
    {children}
  </section>
);

const GlowLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
    {children}
  </p>
);

const IntensityBar: React.FC<{ intensity: 'subtle' | 'medium' | 'strong' }> = ({ intensity }) => {
  const w = intensity === 'subtle' ? 'w-1/4' : intensity === 'medium' ? 'w-1/2' : 'w-full';
  return (
    <div className="mt-5 h-px w-full rounded-full bg-[var(--color-border)]">
      <div className={`h-px rounded-full bg-[var(--color-accent-bright)] opacity-60 transition-all ${w}`} />
    </div>
  );
};

export default GlassShowcase;
