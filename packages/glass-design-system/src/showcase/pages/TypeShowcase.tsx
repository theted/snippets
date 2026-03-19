import React from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from 'glass-design-system';

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section: React.FC<React.PropsWithChildren<{ label: string; sub?: string }>> = ({ label, sub, children }) => (
  <section className="mb-24">
    <div className="mb-8">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-[var(--color-text-subtle)] text-bevel">
        {label}
      </p>
      {sub && (
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)] text-bevel">{sub}</p>
      )}
    </div>
    {children}
  </section>
);

// ── Divider ───────────────────────────────────────────────────────────────────

const Rule: React.FC = () => (
  <div className="my-8 h-px w-full" style={{ background: 'var(--color-border)' }} />
);

// ── Label chip ────────────────────────────────────────────────────────────────

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span
    className="inline-block rounded-full px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.20em]"
    style={{
      background: 'oklch(0.71 0.17 244 / 0.10)',
      border: '1px solid oklch(0.71 0.17 244 / 0.28)',
      color: 'var(--color-accent-bright)',
    }}
  >
    {children}
  </span>
);

// ── Gap swatch ────────────────────────────────────────────────────────────────

const GapSwatch: React.FC<{ gapPx: number; label: string; token: string; isActive?: boolean }> = ({
  gapPx, label, token, isActive,
}) => (
  <div>
    <div className="flex items-end gap-2 mb-3">
      <span
        className="font-[var(--font-display)] text-3xl font-[200] tracking-[-0.05em] text-[var(--color-text)] text-bevel-strong"
      >
        {gapPx}px
      </span>
      {isActive && <Chip>active</Chip>}
    </div>
    <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
      {label} · <code className="font-[var(--font-code)] normal-case tracking-normal text-[var(--color-accent-bright)]">{token}</code>
    </p>
    {/* Visual gap demo — two blocks with the actual gap between them */}
    <div className="flex items-start" style={{ gap: `${gapPx}px` }}>
      <div
        className="h-24 flex-1 rounded-[1.2rem]"
        style={{ background: 'oklch(0.28 0.04 252 / 0.62)', border: '1px solid oklch(0.4 0.044 248 / 0.32)' }}
      />
      <div
        className="h-24 flex-1 rounded-[1.2rem]"
        style={{ background: 'oklch(0.28 0.04 252 / 0.62)', border: '1px solid oklch(0.4 0.044 248 / 0.32)' }}
      />
    </div>
    {/* Ruler line showing the gap */}
    <div className="relative mt-2 flex items-center" style={{ paddingLeft: 'calc(50% + 1px)', paddingRight: 'calc(50% + 1px)' }}>
      <div
        className="absolute left-[calc(50%-1px)] top-1/2 -translate-y-1/2"
        style={{
          width: `${gapPx}px`,
          height: '1px',
          background: 'var(--color-accent)',
          transform: `translateX(-${gapPx / 2}px) translateY(-50%)`,
        }}
      />
    </div>
  </div>
);

// ── Width bar ─────────────────────────────────────────────────────────────────

const WidthBar: React.FC<{ rem: number; label: string; sub: string; isActive?: boolean }> = ({
  rem, label, sub, isActive,
}) => {
  // Represent as a fraction of the largest shown (172rem for reference)
  const pct = Math.min((rem / 172) * 100, 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span className="font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
          {rem}rem
        </span>
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">
          {label}
        </span>
        {isActive && <Chip>active</Chip>}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] text-bevel">{sub}</p>
      <div className="relative h-6 w-full overflow-hidden rounded-full" style={{ background: 'oklch(0.18 0.022 254 / 0.55)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: isActive
              ? 'linear-gradient(90deg, oklch(0.71 0.17 244 / 0.55), oklch(0.79 0.14 226 / 0.40))'
              : 'oklch(0.34 0.04 252 / 0.55)',
            border: isActive ? '1px solid oklch(0.71 0.17 244 / 0.32)' : '1px solid oklch(0.4 0.044 248 / 0.25)',
          }}
        />
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const TypeShowcase: React.FC = () => (
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
          Type &amp; Space
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
          The complete typography and spacing system — every scale step, every font role,
          every gap and container width used across the interface. A living reference for
          how the visual rhythm is composed.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          § 00 — Typefaces
      ══════════════════════════════════════════════════════════════ */}
      <Section label="00 — Typefaces" sub="Three families, each assigned a semantic role that never overlaps.">
        <div className="flex flex-col gap-10">

          {/* Manrope */}
          <GlassPanel intensity="medium" topGlow bottomGlow rounded="rounded-[2rem]" className="p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <Chip>Display · var(--font-display)</Chip>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
                  Manrope · Geometric sans · Weights 200–800
                </p>
              </div>
              <p className="text-xs leading-6 text-[var(--color-text-muted)] max-w-sm text-bevel">
                Used for hero headlines, snippet titles, section headings, and any large display text.
                The extra-light weight (200) gives editorial gravity without visual bulk.
              </p>
            </div>
            <Rule />
            <p className="font-[var(--font-display)] text-[clamp(2.5rem,8vw,5.5rem)] font-[200] leading-[0.88] tracking-[-0.07em] text-[var(--color-text)] text-bevel-strong">
              The quick brown fox<br />jumps over the lazy dog
            </p>
            <Rule />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-2">
              {([200, 300, 400, 700] as const).map((w) => (
                <div key={w}>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel mb-1">
                    {w}
                  </p>
                  <p
                    className="font-[var(--font-display)] text-2xl leading-tight tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong"
                    style={{ fontWeight: w }}
                  >
                    Snippets
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Space Grotesk */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <Chip>Body · var(--font-body)</Chip>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
                  Space Grotesk · Humanist sans · Weights 300–700
                </p>
              </div>
              <p className="text-xs leading-6 text-[var(--color-text-muted)] max-w-sm text-bevel">
                Used for all prose — descriptions, paragraph text, form labels, nav items. The slightly
                quirky letterforms add personality at small sizes where Manrope would feel too stark.
              </p>
            </div>
            <Rule />
            <p
              className="text-[clamp(1.4rem,4vw,2.5rem)] font-[300] leading-[1.3] tracking-[-0.02em] text-[var(--color-text)] text-bevel-strong"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              A spacious, low-light workspace for the fragments you return to most.
              The interface stays quiet so the code can take the room.
            </p>
            <Rule />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-2">
              {([300, 400, 500, 700] as const).map((w) => (
                <div key={w}>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel mb-1">
                    {w}
                  </p>
                  <p
                    className="text-2xl leading-tight tracking-[-0.02em] text-[var(--color-text)] text-bevel"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: w }}
                  >
                    Archive
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* JetBrains Mono */}
          <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <Chip>Code · var(--font-code)</Chip>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
                  JetBrains Mono · Monospace · Ligatures enabled
                </p>
              </div>
              <p className="text-xs leading-6 text-[var(--color-text-muted)] max-w-sm text-bevel">
                Used exclusively for code blocks and inline code. Contextual ligatures
                ({'=>'}, {'<='}, {'!='}, {'/*'}) are enabled via{' '}
                <code className="font-[var(--font-code)] text-[var(--color-accent-bright)]">font-feature-settings</code>.
              </p>
            </div>
            <Rule />
            <pre
              className="overflow-x-auto text-[clamp(0.78rem,2.5vw,1.1rem)] leading-[1.8] tracking-[0.012em] text-[var(--color-text-muted)]"
              style={{ fontFamily: 'var(--font-code)', fontFeatureSettings: "'liga' 1, 'calt' 1" }}
            >
{`const fetchSnippets = async (query?: string) => {
  const url = query ? \`/api/snippets?q=\${query}\` : '/api/snippets';
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<Snippet[]>;
};`}
            </pre>
            <Rule />
            {/* Ligature demo */}
            <div className="flex flex-wrap gap-6 mt-2">
              {['=> <=', '!= ==', '/* */', '-> <-', '|| &&', ':: ..'].map((pair) => (
                <div key={pair} className="text-center">
                  <p
                    className="text-xl text-[var(--color-accent-bright)]"
                    style={{ fontFamily: 'var(--font-code)', fontFeatureSettings: "'liga' 1, 'calt' 1" }}
                  >
                    {pair}
                  </p>
                  <p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
                    ligature
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 01 — Type scale
      ══════════════════════════════════════════════════════════════ */}
      <Section label="01 — Type scale" sub="Every size step used in the interface, from 7rem display headers down to 0.58rem micro-labels.">
        <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="overflow-hidden">
          {[
            { size: 'clamp(3.5rem,10vw,7rem)', role: 'App hero title',      weight: 200, tracking: '-0.07em', font: 'display', sample: 'Snippets' },
            { size: '5rem',                    role: 'Page section hero',    weight: 200, tracking: '-0.07em', font: 'display', sample: 'Archive' },
            { size: '3.75rem',                 role: 'Snippet title (full)', weight: 250, tracking: '-0.06em', font: 'display', sample: 'fetch-utils.ts' },
            { size: '1.875rem',                role: 'Modal heading',        weight: 300, tracking: '-0.04em', font: 'display', sample: 'Edit snippet' },
            { size: '1.25rem',                 role: 'Card sub-heading',     weight: 300, tracking: '-0.03em', font: 'display', sample: 'No snippets yet' },
            { size: '1rem',                    role: 'Body / description',   weight: 400, tracking: 'normal',  font: 'body',    sample: 'A spacious workspace for your code.' },
            { size: '0.875rem',                role: 'Small body',           weight: 400, tracking: 'normal',  font: 'body',    sample: 'Descriptions, paragraph text, tips.' },
            { size: '0.75rem',                 role: 'Caption / detail',     weight: 400, tracking: 'normal',  font: 'body',    sample: 'Last edited · 2 mins ago' },
            { size: '0.72rem',                 role: 'App kicker',           weight: 600, tracking: '0.32em',  font: 'body',    sample: 'Deep-Focus Code Archive' },
            { size: '0.68rem',                 role: 'Section kicker',       weight: 600, tracking: '0.34em',  font: 'body',    sample: '01 — Type scale' },
            { size: '0.62rem',                 role: 'Card kicker / label',  weight: 600, tracking: '0.28em',  font: 'body',    sample: 'Snippet 42' },
            { size: '0.60rem',                 role: 'Compact label',        weight: 600, tracking: '0.24em',  font: 'body',    sample: 'Javascript · Language' },
            { size: '0.58rem',                 role: 'Micro / badge',        weight: 600, tracking: '0.20em',  font: 'body',    sample: 'Active · Tag' },
          ].map(({ size, role, weight, tracking, font, sample }, i) => (
            <div
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--color-border)] px-8 py-6 last:border-0"
            >
              <p
                style={{
                  fontSize: size,
                  fontWeight: weight,
                  letterSpacing: tracking,
                  fontFamily: `var(--font-${font})`,
                  lineHeight: 1.1,
                  color: 'var(--color-text)',
                }}
                className="text-bevel-strong min-w-0 flex-1"
              >
                {sample}
              </p>
              <div className="shrink-0 text-right">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)] text-bevel">{role}</p>
                <p className="mt-0.5 font-[var(--font-code)] text-[0.60rem] text-[var(--color-accent-bright)]">
                  {size} · {weight} · {font}
                </p>
              </div>
            </div>
          ))}
        </GlassPanel>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 02 — Text effects
      ══════════════════════════════════════════════════════════════ */}
      <Section label="02 — Text effects" sub="Three text-shadow utilities for physical depth on different surfaces.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

          <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8">
            <Chip>text-bevel</Chip>
            <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
              Default body text on dark glass
            </p>
            <p className="mt-5 font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] text-bevel leading-tight">
              Raised letterform.<br />Subtle bevel.
            </p>
            <Rule />
            <p className="font-[var(--font-code)] text-[0.64rem] text-[var(--color-text-subtle)]">
              text-shadow: 0 1px 1px black/48%,<br />0 -1px 0 white/7%
            </p>
          </GlassPanel>

          <GlassPanel intensity="strong" topGlow bottomGlow rounded="rounded-[2rem]" className="p-8">
            <Chip>text-bevel-strong</Chip>
            <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
              Headlines and hero text
            </p>
            <p className="mt-5 font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] text-bevel-strong leading-tight">
              Deeper shadow.<br />More presence.
            </p>
            <Rule />
            <p className="font-[var(--font-code)] text-[0.64rem] text-[var(--color-text-subtle)]">
              text-shadow: 0 1px 2px black/62%,<br />0 -1px 0 white/20%,<br />0 2px 16px black/36%
            </p>
          </GlassPanel>

          <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="p-8">
            <Chip>No effect</Chip>
            <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
              Plain text — baseline reference
            </p>
            <p className="mt-5 font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] leading-tight">
              Flat letterform.<br />No depth.
            </p>
            <Rule />
            <p className="font-[var(--font-code)] text-[0.64rem] text-[var(--color-text-subtle)]">
              text-shadow: none
            </p>
          </GlassPanel>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 03 — Text colour tokens
      ══════════════════════════════════════════════════════════════ */}
      <Section label="03 — Colour roles" sub="Four semantic text colours that form a natural hierarchy from prominent to receding.">
        <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="overflow-hidden">
          {[
            { token: '--color-text',        role: 'Primary',  usage: 'Titles, headings, active labels, anything that demands attention first.' },
            { token: '--color-text-muted',  role: 'Body',     usage: 'Descriptions, paragraph text, form content — comfortably readable without competing.' },
            { token: '--color-text-subtle', role: 'Subtle',   usage: 'Kickers, metadata, timestamps, secondary labels — present but not dominant.' },
            { token: '--color-accent-bright', role: 'Accent', usage: 'Interactive highlights, code inline tokens, active state indicators.' },
          ].map(({ token, role, usage }) => (
            <div
              key={token}
              className="flex flex-wrap items-start gap-6 border-b border-[var(--color-border)] px-8 py-7 last:border-0"
            >
              <p
                className="font-[var(--font-display)] text-[clamp(1.4rem,3vw,2rem)] font-[300] tracking-[-0.03em] shrink-0 w-48"
                style={{ color: `var(${token})`, letterSpacing: '-0.03em' }}
              >
                {role}
              </p>
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-code)] text-[0.62rem] text-[var(--color-accent-bright)] mb-2">
                  var({token})
                </p>
                <p className="text-sm leading-6 text-[var(--color-text-muted)] text-bevel">{usage}</p>
              </div>
            </div>
          ))}
        </GlassPanel>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 04 — Type in context
      ══════════════════════════════════════════════════════════════ */}
      <Section label="04 — Composition" sub="All three typefaces working together in realistic content patterns.">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Snippet card replica */}
          <GlassPanel intensity="medium" topGlow bottomGlow rounded="rounded-[2.2rem]" className="p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel">
              Snippet 7
            </p>
            <h3 className="mt-4 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.06em] text-[var(--color-text)] text-bevel-strong leading-tight">
              Debounce hook
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)] text-bevel">
              Returns a debounced version of the value that only updates after the
              specified delay has elapsed — prevents over-fetching on rapid keystrokes.
            </p>
            <div
              className="mt-6 overflow-hidden rounded-[1.4rem] p-4 text-sm leading-7"
              style={{
                background: 'oklch(0.14 0.016 258 / 0.55)',
                fontFamily: 'var(--font-code)',
                color: 'var(--color-text-muted)',
                fontSize: '0.82rem',
                lineHeight: 1.75,
              }}
            >
              <span style={{ color: 'oklch(0.72 0.18 290)' }}>function</span>
              {' useDebounce'}
              <span style={{ color: 'oklch(0.80 0.13 88)' }}>{'<T>'}</span>
              {'(value: T, ms = 600): T {\n  const [v, setV] = '}
              <span style={{ color: 'oklch(0.76 0.16 160)' }}>useState</span>
              {'(value);\n  '}
              <span style={{ color: 'oklch(0.76 0.16 160)' }}>useEffect</span>
              {'(() => {\n    const id = '}
              <span style={{ color: 'oklch(0.71 0.17 244)' }}>setTimeout</span>
              {'(() => setV(value), ms);\n    return () => clearTimeout(id);\n  }, [value, ms]);\n  return v;\n}'}
            </div>
          </GlassPanel>

          {/* Editorial / article layout */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[2.2rem]" className="p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-[var(--color-text-subtle)] text-bevel">
              Design principles
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-[2.4rem] font-[200] tracking-[-0.06em] text-[var(--color-text)] text-bevel-strong leading-[1.05]">
              Background is content.
            </h2>
            <p className="mt-5 text-sm leading-8 text-[var(--color-text-muted)] text-bevel">
              Glass works because what's behind the panel is intentionally beautiful.
              The frosted blur turns the dark gradient and animated orbs into an
              abstract texture — the panel doesn't hide its context, it frames it.
            </p>
            <p className="mt-4 text-sm leading-8 text-[var(--color-text-muted)] text-bevel">
              Every surface draws from two knobs:{' '}
              <code
                className="rounded px-1 text-[0.8em] text-[var(--color-accent-bright)]"
                style={{ fontFamily: 'var(--font-code)' }}
              >
                GLASS_OPACITY
              </code>
              {' '}and{' '}
              <code
                className="rounded px-1 text-[0.8em] text-[var(--color-accent-bright)]"
                style={{ fontFamily: 'var(--font-code)' }}
              >
                GLASS_BLUR
              </code>
              . Adjust them once and the entire interface shifts in unison.
            </p>
            <Rule />
            <div className="flex flex-wrap gap-2">
              {['glass', 'oklch', 'design-system', 'css'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 font-[var(--font-code)] text-[0.62rem] text-[var(--color-accent-bright)]"
                  style={{
                    background: 'oklch(0.71 0.17 244 / 0.10)',
                    border: '1px solid oklch(0.71 0.17 244 / 0.25)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </GlassPanel>

        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 05 — Spacing scale
      ══════════════════════════════════════════════════════════════ */}
      <Section label="05 — Spacing" sub="The gap steps used between snippet cards — from compact grid to editorial stream.">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <GapSwatch gapPx={32} label="Grid (mobile)" token="gap-8" />
          <GapSwatch gapPx={40} label="Grid (desktop)" token="md:gap-10" isActive />
          <GapSwatch gapPx={56} label="Stream (mobile)" token="gap-14" />
          <GapSwatch gapPx={80} label="Stream (desktop)" token="md:gap-20" />
        </div>

        {/* Inline gap ruler visualisation */}
        <GlassPanel intensity="subtle" rounded="rounded-[2rem]" className="mt-8 p-8">
          <p className="mb-6 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
            Relative gap comparison — same container width
          </p>
          {[
            { px: 32,  label: 'Grid mobile · gap-8',       color: 'oklch(0.71 0.17 244 / 0.28)' },
            { px: 40,  label: 'Grid desktop · gap-10',     color: 'oklch(0.71 0.17 244 / 0.48)' },
            { px: 56,  label: 'Stream mobile · gap-14',    color: 'oklch(0.65 0.22 160 / 0.35)' },
            { px: 80,  label: 'Stream desktop · gap-20',   color: 'oklch(0.65 0.22 160 / 0.55)' },
          ].map(({ px, label, color }) => (
            <div key={px} className="flex items-center gap-4 mb-3 last:mb-0">
              <p className="w-52 shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.20em] text-[var(--color-text-subtle)] text-bevel">
                {label}
              </p>
              {/* Ruler bar */}
              <div className="flex flex-1 items-center gap-0">
                <div className="h-6 flex-1 rounded-l-full" style={{ background: 'oklch(0.22 0.026 254 / 0.45)', border: '1px solid oklch(0.4 0.044 248 / 0.25)' }} />
                <div
                  className="relative h-6 shrink-0"
                  style={{ width: `${px}px`, background: color, borderTop: `1px solid ${color.replace('/ 0', '/ 1').slice(0, -1)}1)` }}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center font-[var(--font-code)] text-[0.55rem] font-bold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {px}
                  </span>
                </div>
                <div className="h-6 flex-1 rounded-r-full" style={{ background: 'oklch(0.22 0.026 254 / 0.45)', border: '1px solid oklch(0.4 0.044 248 / 0.25)' }} />
              </div>
            </div>
          ))}
        </GlassPanel>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          § 06 — Container widths
      ══════════════════════════════════════════════════════════════ */}
      <Section label="06 — Layout widths" sub="The max-width steps used for content containers at each breakpoint level.">
        <GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-8 md:p-10">
          <div className="flex flex-col gap-7">
            <WidthBar rem={72}  label="Docs page"       sub="Narrow editorial column — keyboard docs, reference content. Optimised for long-form reading comfort." />
            <WidthBar rem={128} label="Hero text"       sub="Hero headline and subtitle. Wider than body text to allow the display type to breathe across the viewport." isActive />
            <WidthBar rem={132} label="App shell"       sub="The main content container. All snippet cards, the searchbar, and the toolbar live inside this bound." isActive />
            <WidthBar rem={172} label="Full viewport reference" sub="Not a used container — shown here as the 100% reference mark for the bar chart above." />
          </div>

          <Rule />

          {/* Width stacking illustration */}
          <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
            Nested container illustration
          </p>
          <div className="relative w-full rounded-[1.4rem] p-3" style={{ background: 'oklch(0.16 0.018 258 / 0.50)', border: '1px dashed oklch(0.4 0.044 248 / 0.30)' }}>
            <p className="mb-2 text-center font-[var(--font-code)] text-[0.60rem] text-[var(--color-text-subtle)]">Viewport</p>
            {/* 132rem shell */}
            <div className="relative mx-auto w-[92%] rounded-[1.2rem] p-3" style={{ background: 'oklch(0.71 0.17 244 / 0.10)', border: '1px solid oklch(0.71 0.17 244 / 0.30)' }}>
              <p className="mb-2 text-center font-[var(--font-code)] text-[0.60rem] text-[var(--color-accent-bright)]">app-shell · 132rem</p>
              {/* 128rem hero */}
              <div className="relative mx-auto w-[96%] rounded-[1rem] p-3" style={{ background: 'oklch(0.71 0.17 244 / 0.08)', border: '1px solid oklch(0.71 0.17 244 / 0.20)' }}>
                <p className="mb-2 text-center font-[var(--font-code)] text-[0.60rem] text-[var(--color-accent-bright)]">app-hero · 128rem max</p>
                <div className="mx-auto h-4 w-3/4 rounded-full" style={{ background: 'oklch(0.71 0.17 244 / 0.22)' }} />
              </div>
            </div>
          </div>
        </GlassPanel>
      </Section>

    </div>
  </div>
);

export default TypeShowcase;
