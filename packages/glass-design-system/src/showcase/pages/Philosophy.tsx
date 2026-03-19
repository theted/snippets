/* eslint-disable max-len */
import React, {
  useState, useRef, useCallback, useEffect, useLayoutEffect,
} from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { GlassPanel, GLASS_OPACITY, GLASS_BLUR } from 'glass-design-system';

// ─────────────────────────────────────────────────────────────────────────────
// § Illustrations
// ─────────────────────────────────────────────────────────────────────────────

// 01 — One light source
// All three panels track the SAME cursor position, proving a single origin.
const IllustrationLight: React.FC = () => {
  const [pos, setPos] = useState({ x: 72, y: 24 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div ref={ref} className="relative select-none cursor-crosshair" onMouseMove={onMove}>
      {/* Floating light-source dot */}
      <div
        className="pointer-events-none absolute z-20 h-3 w-3 rounded-full"
        style={{
          left: `${pos.x}%`, top: `${pos.y}%`,
          transform: 'translate(-50%,-50%)',
          background: 'oklch(0.95 0.08 65)',
          boxShadow: '0 0 0 6px oklch(0.95 0.08 65 / 0.15), 0 0 18px 4px oklch(0.95 0.08 65 / 0.50)',
          transition: 'left 0.05s linear, top 0.05s linear',
        }}
      />
      <div className="grid grid-cols-3 gap-3" style={{ height: '13rem' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[1.2rem]"
            style={{
              background: 'oklch(0.20 0.024 254 / 0.52)',
              backdropFilter: 'blur(20px)',
              border: '1px solid oklch(0.48 0.06 248 / 0.28)',
              boxShadow: '0 6px 28px oklch(0.05 0.015 250 / 0.34), inset 0 1px 0 oklch(0.82 0.1 230 / 0.14)',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,oklch(0.82 0.1 230 / 0.30),transparent)' }} />
            {/* Light wash follows shared cursor */}
            <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 210% 190% at ${pos.x}% ${pos.y}%,oklch(0.28 0.06 215 / 0.22) 0%,transparent 52%)`, mixBlendMode: 'screen' }} />
            {/* Shadow on opposite side */}
            <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 170% 140% at ${100 - pos.x}% ${100 - pos.y}%,oklch(0.04 0.01 255 / 0.18) 0%,transparent 55%)` }} />
            <div className="absolute bottom-3 left-0 right-0 text-center text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
              Panel {i + 1}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
        Move cursor — one origin, three surfaces
      </p>
    </div>
  );
};

// 02 — Background is content
const IllustrationBackground: React.FC = () => {
  const [rich, setRich] = useState(true);
  return (
    <div className="space-y-4">
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden rounded-[1.6rem] transition-all duration-700"
        style={{
          background: rich
            ? `radial-gradient(circle at 18% 28%, oklch(0.42 0.26 216 / 0.55), transparent 38%),
               radial-gradient(circle at 82% 72%, oklch(0.52 0.26 280 / 0.45), transparent 36%),
               radial-gradient(circle at 50% 100%, oklch(0.12 0.08 248 / 0.9), transparent 55%),
               linear-gradient(145deg, oklch(0.13 0.042 248) 0%, oklch(0.08 0.030 260) 100%)`
            : 'oklch(0.24 0 0)',
        }}
      >
        <div
          className="relative overflow-hidden rounded-[1.1rem] px-7 py-4"
          style={{
            background: 'oklch(0.20 0.024 254 / 0.45)',
            backdropFilter: `blur(${rich ? 24 : 0}px)`,
            border: `1px solid oklch(0.48 0.06 248 / ${rich ? '0.30' : '0.10'})`,
            transition: 'all 0.7s ease',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,oklch(0.82 0.1 230 / ${rich ? '0.38' : '0.10'}),transparent)`, transition: 'all 0.7s' }} />
          <p className="text-xs font-semibold text-[var(--color-text)]">Glass panel</p>
          <p className="mt-0.5 text-[0.62rem] text-[var(--color-text-subtle)]">
            {rich ? 'Frosting a rich gradient below' : 'Nothing to frost — effect collapses'}
          </p>
        </div>
      </div>
      <button
        onClick={() => setRich(!rich)}
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition duration-200 hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]"
      >
        {rich ? 'Remove backdrop →' : '← Restore backdrop'}
      </button>
    </div>
  );
};

// 03 — Two knobs
const IllustrationKnobs: React.FC = () => {
  const [opacity, setOpacity] = useState(GLASS_OPACITY);
  const [blur, setBlur] = useState(GLASS_BLUR);
  const bgAlpha = (opacity * 0.30).toFixed(3);
  const borderAlpha = (opacity * 0.32).toFixed(3);
  const shimmerAlpha = (opacity * 0.36).toFixed(3);

  return (
    <div className="space-y-5">
      <div
        className="flex h-40 items-center justify-center rounded-[1.6rem]"
        style={{
          background: `radial-gradient(circle at 18% 28%, oklch(0.42 0.26 216 / 0.45), transparent 40%),
                       linear-gradient(145deg, oklch(0.13 0.042 248), oklch(0.08 0.030 260))`,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[1.1rem] px-7 py-4"
          style={{
            background: `oklch(0.20 0.024 254 / ${bgAlpha})`,
            backdropFilter: `blur(${blur}px)`,
            border: `1px solid oklch(0.48 0.06 248 / ${borderAlpha})`,
            boxShadow: `0 8px 32px oklch(0.05 0.015 250 / ${(opacity * 0.34).toFixed(3)})`,
            transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,oklch(0.82 0.1 230 / ${shimmerAlpha}),transparent)` }} />
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">Live surface</p>
          <p className="mt-1 font-[var(--font-code)] text-[0.68rem] text-[var(--color-accent-bright)]">
            opacity {opacity.toFixed(2)} · blur {blur}px
          </p>
        </div>
      </div>
      <div className="space-y-3.5">
        {[
          { label: 'GLASS_OPACITY', value: opacity, min: 0.05, max: 1, step: 0.01, set: setOpacity, fmt: (v: number) => v.toFixed(2) },
          { label: 'GLASS_BLUR', value: blur, min: 0, max: 80, step: 1, set: setBlur, fmt: (v: number) => `${v}px` },
        ].map(({ label, value, min, max, step, set, fmt }) => (
          <div key={label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">{label}</span>
              <span className="font-[var(--font-code)] text-[0.68rem] text-[var(--color-accent-bright)]">{fmt(value)}</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'oklch(0.30 0.02 254 / 0.5)' }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${((value - min) / (max - min)) * 100}%`, background: 'var(--color-accent-bright)' }} />
            </div>
            <input
              type="range" min={min} max={max} step={step} value={value}
              onChange={(e) => set(Number(e.target.value))}
              className="relative mt-[-0.4rem] h-1.5 w-full cursor-pointer opacity-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 04 — Depth through opacity
const TIERS = [
  { intensity: 'subtle' as const,  label: 'Subtle',  role: 'Background context',  pal: '0.17' },
  { intensity: 'medium' as const,  label: 'Medium',  role: 'Standard content',    pal: '0.30' },
  { intensity: 'strong' as const,  label: 'Strong',  role: 'Modal / dialog',      pal: '0.64' },
];

const IllustrationDepth: React.FC = () => {
  const [focus, setFocus] = useState<number | null>(null);
  return (
    <div
      className="relative space-y-2.5 rounded-[1.6rem] p-4"
      style={{
        background: `radial-gradient(circle at 18% 28%, oklch(0.42 0.24 216 / 0.28), transparent 42%),
                     linear-gradient(145deg, oklch(0.12 0.040 248), oklch(0.08 0.028 260))`,
      }}
    >
      {TIERS.map((tier, i) => (
        <GlassPanel
          key={tier.label}
          intensity={tier.intensity}
          topGlow={i === 2}
          rounded="rounded-[1rem]"
          className={`cursor-pointer px-5 py-4 transition-all duration-250 ${focus === i ? 'scale-[1.03] ring-1 ring-[var(--color-accent-soft)]' : 'hover:scale-[1.015]'}`}
          onClick={() => setFocus(focus === i ? null : i)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">{tier.label}</p>
              <p className="mt-0.5 text-[0.72rem] text-[var(--color-text-muted)]">{tier.role}</p>
            </div>
            <div
              className="h-5 w-10 rounded-full border"
              style={{ background: `oklch(0.20 0.024 254 / ${tier.pal})`, borderColor: 'oklch(0.48 0.06 248 / 0.28)' }}
            />
          </div>
        </GlassPanel>
      ))}
      <p className="pt-0.5 text-center text-[0.55rem] font-semibold uppercase tracking-[0.20em] text-[var(--color-text-subtle)]">
        Tap a tier
      </p>
    </div>
  );
};

// 05 — Colour as atmosphere
const SWATCHES = [
  { name: 'Sapphire', color: 'oklch(0.55 0.28 240)', hue: 240 },
  { name: 'Teal',     color: 'oklch(0.60 0.22 200)', hue: 200 },
  { name: 'Violet',   color: 'oklch(0.58 0.26 290)', hue: 290 },
  { name: 'Rose',     color: 'oklch(0.62 0.22 10)',  hue: 10  },
  { name: 'Amber',    color: 'oklch(0.72 0.20 72)',  hue: 72  },
  { name: 'Emerald',  color: 'oklch(0.65 0.22 160)', hue: 160 },
];

const IllustrationColour: React.FC = () => {
  const [active, setActive] = useState(SWATCHES[0]);
  return (
    <div className="space-y-4">
      <div
        className="flex h-44 items-center justify-center rounded-[1.6rem]"
        style={{
          background: `radial-gradient(circle at 18% 28%, oklch(0.42 0.24 216 / 0.40), transparent 40%),
                       linear-gradient(145deg, oklch(0.12 0.040 248), oklch(0.08 0.028 260))`,
        }}
      >
        <GlassPanel intensity="medium" topGlow rounded="rounded-[1.2rem]" className="relative w-48 overflow-hidden px-6 py-5">
          {/* Colour wash — screen blend preserves texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: active.color, mixBlendMode: 'screen', opacity: 0.18, transition: 'background 0.5s ease' }}
          />
          <p className="relative z-10 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)] transition-all duration-500">
            {active.name}
          </p>
          <p className="relative z-10 mt-1 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)]">
            hue {active.hue}
          </p>
          <p className="relative z-10 mt-0.5 text-[0.60rem] text-[var(--color-text-subtle)]">
            screen · opacity 0.18
          </p>
        </GlassPanel>
      </div>
      <div className="flex justify-center gap-2.5">
        {SWATCHES.map((s) => (
          <button
            key={s.name}
            onClick={() => setActive(s)}
            title={s.name}
            className="h-6 w-6 rounded-full transition-all duration-150 hover:scale-110"
            style={{
              background: s.color,
              boxShadow: active.name === s.name
                ? `0 0 0 2px oklch(0.12 0.04 248), 0 0 0 4px ${s.color}`
                : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 06 — Motion reinforces material
const MOTIONS = [
  { label: 'Enter',  run: (el: HTMLElement) => gsap.fromTo(el, { opacity: 0, y: 22, filter: 'blur(6px)' },     { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }) },
  { label: 'Rise',   run: (el: HTMLElement) => gsap.fromTo(el, { opacity: 0, y: 38, scale: 0.92 },             { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }) },
  { label: 'Slide',  run: (el: HTMLElement) => gsap.fromTo(el, { opacity: 0, x: -44 },                        { opacity: 1, x: 0, duration: 0.48, ease: 'power2.out' }) },
  { label: 'Pulse',  run: (el: HTMLElement) => gsap.to(el, { scale: 1.05, duration: 0.20, yoyo: true, repeat: 1, ease: 'power2.inOut' }) },
];

const IllustrationMotion: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback((m: typeof MOTIONS[0]) => {
    if (!panelRef.current || busy) return;
    setBusy(true);
    m.run(panelRef.current).then(() => setBusy(false));
  }, [busy]);

  return (
    <div className="space-y-4">
      <div
        className="flex h-44 items-center justify-center rounded-[1.6rem]"
        style={{
          background: `radial-gradient(circle at 18% 28%, oklch(0.42 0.24 216 / 0.35), transparent 40%),
                       linear-gradient(145deg, oklch(0.12 0.040 248), oklch(0.08 0.028 260))`,
        }}
      >
        <div ref={panelRef}>
          <GlassPanel intensity="medium" topGlow rounded="rounded-[1.1rem]" className="px-8 py-5">
            <p className="text-xs font-semibold text-[var(--color-text)]">Glass surface</p>
            <p className="mt-0.5 text-[0.60rem] text-[var(--color-text-subtle)]">Physical material</p>
          </GlassPanel>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {MOTIONS.map((m) => (
          <button
            key={m.label}
            onClick={() => run(m)}
            disabled={busy}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)] transition duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)] disabled:opacity-35"
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// § Principle data
// ─────────────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    n: '01',
    title: 'One\nlight source',
    body: `Every panel in the system behaves as if illuminated from the same upper-right corner. The top-edge shimmer line, the corner glow, and the inset box-shadow all point toward a single imaginary origin — so layering panels creates depth without contradiction.`,
    aside: `A consistent light source makes complex UIs feel physically coherent, the way a room feels unified when lit by a single window.`,
    Demo: IllustrationLight,
  },
  {
    n: '02',
    title: 'Background\nis content',
    body: `Glass works because what's behind the panel is intentionally beautiful. The frosted blur transforms the dark gradient and ambient orbs into an abstract texture — the panel doesn't obscure its context, it frames it. Remove the gradient and the glass collapses into a flat box.`,
    aside: `This is why the body background uses \`background-attachment: fixed\`. The light field must stay stationary while content scrolls overhead.`,
    Demo: IllustrationBackground,
  },
  {
    n: '03',
    title: 'Two knobs,\ninfinite surface',
    body: `GLASS_OPACITY and GLASS_BLUR are the only global controls. Every surface — cards, modals, navigation bars, toasts — is a proportional multiplier of those two values. Adjust once and the entire interface shifts in unison. No individual component needs to be touched.`,
    aside: `Per-intensity alphas are stored as base values and scaled at runtime. This guarantees proportional relationships survive any global retheme.`,
    Demo: IllustrationKnobs,
  },
  {
    n: '04',
    title: 'Depth through\nopacity',
    body: `Panels closer to the viewer use "strong" intensity. Background panels use "subtle". The three tiers — subtle, medium, strong — create a natural focus hierarchy through opacity alone, without relying on drop shadows or z-index gymnastics.`,
    aside: `Modals are always strong. Content cards are medium. Context frames are subtle. Never reverse this order.`,
    Demo: IllustrationDepth,
  },
  {
    n: '05',
    title: 'Colour as\natmosphere',
    body: `Tinted glass is not branding — it is emotional temperature. Blue is analytical. Amber signals caution. Emerald signals life. The tint is always applied as a screen-blend wash at low opacity, never as a flat fill, so the frosted texture and grain remain intact beneath.`,
    aside: `Screen blending merges a colour's hue into existing luminosity. The glass appears tinted but still translucent — a dye, not a coat of paint.`,
    Demo: IllustrationColour,
  },
  {
    n: '06',
    title: 'Motion\nreinforces material',
    body: `The mouse-tracking radial gradient inside each panel simulates specular reflection — light bouncing off the surface as the cursor moves. GSAP handles entrances and exits so glass feels like it has physical weight: it doesn't just appear, it arrives.`,
    aside: `Material metaphors lower cognitive load. When a modal arrives with blur and upward travel, the user understands it is elevated before reading a word.`,
    Demo: IllustrationMotion,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// § Scroll progress hook
// ─────────────────────────────────────────────────────────────────────────────

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return progress;
}

// ─────────────────────────────────────────────────────────────────────────────
// § Page entrance animation
// ─────────────────────────────────────────────────────────────────────────────

function useEntranceAnimation(ref: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll<HTMLElement>('.phil-enter');
    gsap.fromTo(
      Array.from(items),
      { opacity: 0, y: 28, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: 0.1 },
    );
  }, [ref]);
}

// ─────────────────────────────────────────────────────────────────────────────
// § Page
// ─────────────────────────────────────────────────────────────────────────────

const Philosophy: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress();
  useEntranceAnimation(rootRef);

  return (
    <div ref={rootRef} className="App relative">
      {/* ── Scroll progress bar ── */}
      <div
        className="fixed left-0 top-0 z-50 h-[2px] origin-left"
        style={{
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))',
          transition: 'width 0.08s linear',
        }}
      />

      {/* ── Chapter marker (fixed side) ── */}
      <div className="fixed bottom-8 right-6 z-40 hidden flex-col items-center gap-1 md:flex">
        {PRINCIPLES.map((p, i) => (
          <div
            key={p.n}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: progress >= i / PRINCIPLES.length && progress < (i + 1) / PRINCIPLES.length ? '2rem' : '0.6rem',
              background: progress >= i / PRINCIPLES.length && progress < (i + 1) / PRINCIPLES.length
                ? 'var(--color-accent-bright)'
                : 'oklch(0.48 0.06 248 / 0.38)',
            }}
          />
        ))}
      </div>

      <div className="mx-auto w-full max-w-[96rem] px-[clamp(1.25rem,5vw,5rem)]">

        {/* ══════════════════════════════════════════════════════════════
            Hero
        ══════════════════════════════════════════════════════════════ */}
        <header className="relative flex min-h-[92vh] flex-col justify-end pb-[clamp(3rem,8vw,6rem)]">
          {/* Giant decorative background word */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden text-center leading-none"
            style={{ fontSize: 'clamp(6rem,22vw,18rem)', fontFamily: 'var(--font-display)', fontWeight: 100, color: 'oklch(0.98 0.006 255 / 0.025)', letterSpacing: '-0.06em' }}
          >
            Philosophy
          </div>

          <div className="relative z-10">
            <p className="phil-enter mb-6 text-[0.72rem] font-semibold uppercase tracking-[0.44em] text-[var(--color-text-subtle)]">
              Glass Design System
            </p>
            <h1
              className="phil-enter font-[var(--font-display)] font-[200] leading-[0.90] tracking-[-0.065em] text-[var(--color-text)]"
              style={{ fontSize: 'clamp(3.5rem,10vw,8.5rem)' }}
            >
              Design<br />
              <span style={{ color: 'oklch(0.79 0.14 226)' }}>Philosophy</span>
            </h1>
            <p className="phil-enter mt-10 max-w-2xl text-[clamp(0.9rem,1.4vw,1.1rem)] leading-[1.85] text-[var(--color-text-muted)]">
              Six principles govern every surface in this interface — from cards to modals to navigation bars. Together they answer a single question: <em className="text-[var(--color-text)]">how does glass feel alive?</em>
            </p>
            <div className="phil-enter mt-12 flex items-center gap-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] transition duration-200 hover:text-[var(--color-text)]"
              >
                <i className="icon-home" style={{ fontSize: '0.8em' }} />
                Archive
              </Link>
              <Link
                to="/glass"
                className="inline-flex items-center gap-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] transition duration-200 hover:text-[var(--color-text)]"
              >
                Glass showcase →
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="phil-enter absolute bottom-8 right-0 flex flex-col items-center gap-3 opacity-40">
            <div className="h-12 w-px bg-gradient-to-b from-transparent to-[var(--color-text-subtle)]" />
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)]" style={{ writingMode: 'vertical-rl' }}>
              Scroll
            </p>
          </div>
        </header>

        {/* Divider */}
        <div className="mb-[clamp(5rem,10vw,9rem)] h-px w-full bg-gradient-to-r from-transparent via-[oklch(0.48_0.06_248_/_0.30)] to-transparent" />

        {/* ══════════════════════════════════════════════════════════════
            Principles
        ══════════════════════════════════════════════════════════════ */}
        {PRINCIPLES.map((p, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={p.n}
              className="relative mb-[clamp(7rem,14vw,13rem)] grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
            >
              {/* Giant decorative chapter number */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-[0.15em] select-none leading-none"
                style={{
                  left: flip ? 'auto' : '-0.02em',
                  right: flip ? '-0.02em' : 'auto',
                  fontSize: 'clamp(10rem,26vw,22rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 100,
                  color: 'oklch(0.98 0.006 255 / 0.028)',
                  letterSpacing: '-0.04em',
                }}
              >
                {p.n}
              </div>

              {/* ── Text column ── */}
              <div className={`relative z-10 ${flip ? 'lg:order-2' : 'lg:order-1'}`}>
                <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-[var(--color-text-subtle)]">
                  Principle {p.n}
                </p>
                <h2
                  className="font-[var(--font-display)] font-[200] leading-[0.93] tracking-[-0.055em] text-[var(--color-text)] whitespace-pre-line"
                  style={{ fontSize: 'clamp(2.4rem,5.5vw,4.5rem)' }}
                >
                  {p.title}
                </h2>
                <p className="mt-8 text-[clamp(0.85rem,1.2vw,1rem)] leading-[1.88] text-[var(--color-text-muted)]">
                  {p.body}
                </p>
                <div
                  className="mt-7 border-l-2 pl-5 text-[0.88rem] leading-relaxed italic text-[var(--color-text-subtle)]"
                  style={{ borderColor: 'var(--color-accent-soft)' }}
                >
                  {p.aside}
                </div>
              </div>

              {/* ── Illustration column ── */}
              <div className={`relative z-10 ${flip ? 'lg:order-1' : 'lg:order-2'}`}>
                <GlassPanel
                  intensity="subtle"
                  topGlow
                  rounded="rounded-[2rem]"
                  className="p-6 md:p-8"
                >
                  <p.Demo />
                </GlassPanel>
              </div>
            </section>
          );
        })}

        {/* ══════════════════════════════════════════════════════════════
            Closing
        ══════════════════════════════════════════════════════════════ */}
        <footer className="relative mb-[clamp(4rem,8vw,7rem)] flex flex-col items-center py-[clamp(4rem,8vw,7rem)] text-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[oklch(0.48_0.06_248_/_0.30)] to-transparent" />
          <div className="mt-20">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-[var(--color-text-subtle)]">
              End of document
            </p>
            <p
              className="mt-4 font-[var(--font-display)] font-[200] leading-none tracking-[-0.06em] text-[var(--color-text)]"
              style={{ fontSize: 'clamp(2.5rem,7vw,5.5rem)' }}
            >
              Glass in practice
            </p>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-[var(--color-text-muted)]">
              See every principle rendered live — intensities, tints, blur levels, nesting, navigation patterns — in the Glass showcase.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/glass"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-8 py-4 text-[0.70rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)]"
              >
                Glass showcase
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-8 py-4 text-[0.70rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                <i className="icon-home" style={{ fontSize: '0.8em' }} />
                Back to archive
              </Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Philosophy;
