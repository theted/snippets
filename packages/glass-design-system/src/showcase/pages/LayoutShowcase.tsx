import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, GlassPill, GlassDivider, GlassProvider } from 'glass-design-system';

// ── Shared atoms ──────────────────────────────────────────────────────────────

const PageSection: React.FC<React.PropsWithChildren<{ id: string }>> = ({ id, children }) => (
  <section id={id} className="mb-28 scroll-mt-24">
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

const Code: React.FC<React.PropsWithChildren> = ({ children }) => (
  <code className="rounded-md border border-[var(--color-border)] bg-[oklch(0.14_0.018_254_/_0.6)] px-1.5 py-0.5 font-[var(--font-code)] text-[0.78em] text-[var(--color-accent-bright)]">
    {children}
  </code>
);

// A glass panel filled with placeholder anatomy text — used as stand-in content
const Plate: React.FC<{
  label: string;
  sub?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  topGlow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  accent?: string;
}> = ({ label, sub, intensity = 'medium', topGlow = true, className = '', style, accent }) => (
  <GlassPanel
    intensity={intensity}
    topGlow={topGlow}
    rounded="rounded-[1.6rem]"
    className={`p-6 ${className}`}
    style={style}
  >
    <div className="relative z-10">
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: accent, mixBlendMode: 'screen', opacity: 0.14 }}
        />
      )}
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel">
        {label}
      </p>
      {sub && (
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">{sub}</p>
      )}
    </div>
  </GlassPanel>
);

// A code snippet block used for layout examples
const CodeBlock: React.FC<{ children: string }> = ({ children }) => (
  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.2rem]" className="mt-4 p-5">
    <pre className="overflow-x-auto font-[var(--font-code)] text-[0.68rem] leading-6 text-[var(--color-text-muted)]">
      <code>{children}</code>
    </pre>
  </GlassPanel>
);

// ── § Column Grid ─────────────────────────────────────────────────────────────

const GRID_CONFIGS = [
  { label: '2 columns', code: 'grid-cols-2', cols: 2 },
  { label: '3 columns', code: 'grid-cols-3', cols: 3 },
  { label: '4 columns', code: 'grid-cols-4', cols: 4 },
] as const;

const ColumnGridSection: React.FC = () => {
  const [active, setActive] = useState<2 | 3 | 4>(3);
  const cfg = GRID_CONFIGS.find((c) => c.cols === active)!;

  return (
    <>
      {/* Column count picker */}
      <div className="mb-5 flex gap-2">
        {GRID_CONFIGS.map(({ label, cols }) => (
          <GlassPill
            key={cols}
            size="sm"
            variant={active === cols ? 'active' : 'default'}
            onClick={() => setActive(cols as 2 | 3 | 4)}
          >
            {label}
          </GlassPill>
        ))}
      </div>

      {/* Equal-width grid */}
      <DemoLabel>Equal-width — {cfg.code} gap-6</DemoLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${active}, minmax(0, 1fr))`,
          gap: '1.5rem',
        }}
      >
        {Array.from({ length: active }).map((_, i) => (
          <Plate
            key={i}
            label={`Col ${i + 1} / ${active}`}
            sub="1fr"
            intensity="medium"
          />
        ))}
      </div>

      <CodeBlock>{`<div className="grid ${cfg.code} gap-6">
  {items.map((item) => (
    <GlassPanel key={item.id} intensity="medium" …>
      {item.content}
    </GlassPanel>
  ))}
</div>`}</CodeBlock>

      <GlassDivider className="my-10" />

      {/* Asymmetric grids */}
      <DemoLabel>Asymmetric proportions</DemoLabel>
      <div className="flex flex-col gap-6">

        {/* 2:1 split */}
        <div>
          <p className="mb-3 text-[0.60rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
            2 : 1 — <Code>grid-cols-[2fr_1fr]</Code>
          </p>
          <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <Plate label="Main" sub="2fr — primary content area" intensity="medium" />
            <Plate label="Aside" sub="1fr — secondary" intensity="subtle" topGlow={false} />
          </div>
        </div>

        {/* 1:2:1 split */}
        <div>
          <p className="mb-3 text-[0.60rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
            1 : 2 : 1 — <Code>grid-cols-[1fr_2fr_1fr]</Code>
          </p>
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
            <Plate label="Nav" sub="1fr" intensity="subtle" topGlow={false} />
            <Plate label="Content" sub="2fr — hero focus" intensity="medium" />
            <Plate label="Panel" sub="1fr" intensity="subtle" topGlow={false} />
          </div>
        </div>

        {/* fixed + fluid */}
        <div>
          <p className="mb-3 text-[0.60rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-subtle)]">
            Fixed + fluid — <Code>grid-cols-[280px_1fr]</Code>
          </p>
          <div className="grid gap-5" style={{ gridTemplateColumns: '280px 1fr' }}>
            <Plate label="Sidebar" sub="280px — fixed width" intensity="subtle" topGlow={false} />
            <Plate label="Main" sub="1fr — fills remaining space" intensity="medium" />
          </div>
        </div>
      </div>

      <CodeBlock>{`{/* 2:1 asymmetric split */}
<div className="grid gap-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
  <GlassPanel intensity="medium" …>Main content</GlassPanel>
  <GlassPanel intensity="subtle" …>Aside</GlassPanel>
</div>

{/* Fixed sidebar + fluid main */}
<div className="grid gap-5" style={{ gridTemplateColumns: '280px 1fr' }}>
  <GlassPanel intensity="subtle" …>Sidebar</GlassPanel>
  <GlassPanel intensity="medium" …>Main</GlassPanel>
</div>`}</CodeBlock>

      <GlassDivider className="my-10" />

      {/* auto-fill responsive */}
      <DemoLabel>Auto-fill responsive — no breakpoints needed</DemoLabel>
      <p className="mb-4 text-[0.72rem] leading-6 text-[var(--color-text-muted)]">
        <Code>{'repeat(auto-fill, minmax(220px, 1fr))'}</Code> — columns appear as space allows.
        Resize the window to see the grid reflow automatically.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map((name) => (
          <Plate key={name} label={name} sub="auto-fill cell" intensity="subtle" topGlow={false} />
        ))}
      </div>

      <CodeBlock>{`{/* Fluid responsive — no media queries */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1.25rem',
}}>
  {items.map((item) => (
    <GlassPanel key={item.id} intensity="subtle" …>
      {item.content}
    </GlassPanel>
  ))}
</div>`}</CodeBlock>
    </>
  );
};

// ── § Bento Grid ──────────────────────────────────────────────────────────────

const BentoSection: React.FC = () => (
  <>
    <DemoLabel>Bento — spanning cells in a 4-column grid</DemoLabel>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridAutoRows: '180px',
        gap: '1.25rem',
      }}
    >
      {/* Featured — 2 cols × 2 rows */}
      <GlassPanel
        intensity="strong"
        topGlow
        bottomGlow
        rounded="rounded-[1.8rem]"
        style={{ gridColumn: 'span 2', gridRow: 'span 2' }}
        className="p-8 flex flex-col justify-between"
      >
        <div className="relative z-10">
          <p className="text-[0.60rem] font-semibold uppercase tracking-[0.30em] text-[var(--color-text-subtle)] text-bevel">
            Featured
          </p>
          <p className="mt-3 font-[var(--font-display)] text-3xl font-[200] tracking-[-0.05em] text-[var(--color-text)] text-bevel-strong leading-tight">
            Spans 2 cols<br />& 2 rows
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
            <Code>grid-column: span 2</Code><br />
            <Code>grid-row: span 2</Code>
          </p>
        </div>
        <div className="relative z-10 flex gap-2">
          <GlassPill size="xs" variant="accent">Primary CTA</GlassPill>
          <GlassPill size="xs">Secondary</GlassPill>
        </div>
      </GlassPanel>

      {/* Wide — 2 cols × 1 row */}
      <GlassPanel
        intensity="medium"
        topGlow
        rounded="rounded-[1.6rem]"
        style={{ gridColumn: 'span 2' }}
        className="p-6 flex items-center gap-5"
      >
        <div className="relative z-10 flex items-center gap-5 w-full">
          <div
            className="flex-none flex items-center justify-center rounded-full text-lg"
            style={{
              width: '3rem', height: '3rem',
              background: 'oklch(0.52 0.24 238 / 0.18)',
              border: '1px solid oklch(0.52 0.24 238 / 0.30)',
            }}
          >
            ◈
          </div>
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">Wide — 2 cols</p>
            <p className="mt-0.5 text-sm font-[300] text-[var(--color-text)]">Spans the full right half</p>
          </div>
        </div>
      </GlassPanel>

      {/* Tall — 1 col × 2 rows */}
      <GlassPanel
        intensity="subtle"
        topGlow={false}
        rounded="rounded-[1.6rem]"
        style={{ gridRow: 'span 2' }}
        className="p-6 flex flex-col justify-between"
      >
        <div className="relative z-10">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
            Tall — 2 rows
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Vertical emphasis for lists or stats
          </p>
        </div>
        <div className="relative z-10 space-y-2">
          {['Item one', 'Item two', 'Item three'].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 text-[0.68rem] text-[var(--color-text-muted)]"
            >
              <span style={{ color: 'var(--color-accent-bright)', fontSize: '0.5rem' }}>◆</span>
              {t}
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Single cell */}
      <Plate label="1 × 1" sub="Standard cell" intensity="subtle" topGlow={false} />

      {/* Last wide — 3 cols */}
      <GlassPanel
        intensity="subtle"
        topGlow={false}
        rounded="rounded-[1.6rem]"
        style={{ gridColumn: 'span 3' }}
        className="p-6"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
              Footer bar — 3 cols
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Spans three of four columns</p>
          </div>
          <GlassPill size="xs">Action</GlassPill>
        </div>
      </GlassPanel>

      {/* 1 × 1 */}
      <Plate label="1 × 1" sub="end cell" intensity="subtle" topGlow={false} />
    </div>

    <CodeBlock>{`{/* 4-column bento with spanning cells */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridAutoRows: '180px',
  gap: '1.25rem',
}}>
  {/* Featured hero — 2 cols × 2 rows */}
  <GlassPanel
    intensity="strong"
    style={{ gridColumn: 'span 2', gridRow: 'span 2' }}
    …
  />

  {/* Wide banner — 2 cols × 1 row */}
  <GlassPanel intensity="medium" style={{ gridColumn: 'span 2' }} … />

  {/* Tall sidebar — 1 col × 2 rows */}
  <GlassPanel intensity="subtle" style={{ gridRow: 'span 2' }} … />

  {/* Footer bar — 3 cols */}
  <GlassPanel intensity="subtle" style={{ gridColumn: 'span 3' }} … />
</div>`}</CodeBlock>
  </>
);

// ── § Sidebar Layout ──────────────────────────────────────────────────────────

const SidebarSection: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  return (
    <>
      <DemoLabel>Sidebar layout — fixed-width nav + fluid content</DemoLabel>

      {/* Width control */}
      <div className="mb-5 flex items-center gap-4">
        <p className="text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
          Sidebar width — <span className="text-[var(--color-accent-bright)]">{sidebarWidth}px</span>
        </p>
        <input
          type="range" min={180} max={360} step={20} value={sidebarWidth}
          onChange={(e) => setSidebarWidth(Number(e.target.value))}
          className="accent-[var(--color-accent)]"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${sidebarWidth}px 1fr`,
          gridTemplateRows: 'auto 1fr',
          gap: '1rem',
          minHeight: '420px',
        }}
      >
        {/* Sidebar — spans 2 rows */}
        <GlassPanel
          intensity="subtle"
          topGlow={false}
          rounded="rounded-[1.6rem]"
          style={{ gridRow: 'span 2' }}
          className="p-5 flex flex-col gap-3"
        >
          <div className="relative z-10">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
              Navigation
            </p>
            <div className="mt-4 space-y-1">
              {['Dashboard', 'Snippets', 'Collections', 'Settings', 'Profile'].map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-[0.8rem] px-3 py-2.5 text-xs transition-colors duration-200"
                  style={{
                    background: i === 0 ? 'oklch(0.52 0.24 238 / 0.14)' : 'transparent',
                    color: i === 0 ? 'var(--color-accent-bright)' : 'var(--color-text-muted)',
                    border: i === 0 ? '1px solid oklch(0.52 0.24 238 / 0.22)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    {['⊞', '◈', '⊟', '⚙', '○'][i]}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <GlassDivider className="mb-3" />
            <div className="flex items-center gap-2.5">
              <div
                className="flex-none rounded-full flex items-center justify-center text-[0.6rem] font-bold"
                style={{
                  width: '2rem', height: '2rem',
                  background: 'oklch(0.52 0.24 238 / 0.20)',
                  color: 'var(--color-accent-bright)',
                }}
              >
                FJ
              </div>
              <div>
                <p className="text-[0.62rem] font-semibold text-[var(--color-text)]">Fredrik J.</p>
                <p className="text-[0.56rem] text-[var(--color-text-subtle)]">Pro plan</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Topbar */}
        <GlassPanel
          intensity="subtle"
          topGlow={false}
          rounded="rounded-[1.6rem]"
          className="p-4 flex items-center justify-between"
        >
          <div className="relative z-10">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">Topbar</p>
          </div>
          <div className="relative z-10 flex gap-2">
            <GlassPill size="xs">Filter</GlassPill>
            <GlassPill size="xs" variant="accent">+ New</GlassPill>
          </div>
        </GlassPanel>

        {/* Main content */}
        <GlassPanel
          intensity="medium"
          topGlow
          rounded="rounded-[1.6rem]"
          className="p-6 flex flex-col"
        >
          <div className="relative z-10">
            <p className="text-[0.60rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)] text-bevel">
              Main content
            </p>
            <p className="mt-1 font-[var(--font-display)] text-xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
              {sidebarWidth}px sidebar + fluid main
            </p>
            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)] text-bevel">
              The sidebar spans two grid rows (topbar + content) via <Code>grid-row: span 2</Code>.
              Drag the slider to see how the fixed sidebar pushes the fluid column.
            </p>
          </div>
        </GlassPanel>
      </div>

      <CodeBlock>{`<div style={{
  display: 'grid',
  gridTemplateColumns: '260px 1fr',   // fixed sidebar + fluid main
  gridTemplateRows: 'auto 1fr',       // topbar row + content row
  gap: '1rem',
  minHeight: '100vh',
}}>
  {/* Sidebar spans both rows */}
  <GlassPanel intensity="subtle" style={{ gridRow: 'span 2' }} … />

  {/* Topbar — top-right cell */}
  <GlassPanel intensity="subtle" … />

  {/* Main content — bottom-right cell */}
  <GlassPanel intensity="medium" … />
</div>`}</CodeBlock>
    </>
  );
};

// ── § Dashboard ───────────────────────────────────────────────────────────────

type StatCardProps = { label: string; value: string; delta: string; positive: boolean };

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, positive }) => (
  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
    <div className="relative z-10">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">{label}</p>
      <p className="mt-2 font-[var(--font-display)] text-3xl font-[200] tracking-[-0.05em] text-[var(--color-text)] text-bevel-strong">
        {value}
      </p>
      <p
        className="mt-1 text-[0.68rem] font-semibold"
        style={{ color: positive ? 'var(--color-success)' : 'var(--color-danger)' }}
      >
        {positive ? '▲' : '▼'} {delta}
      </p>
    </div>
  </GlassPanel>
);

const MiniSparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 100 / (values.length - 1);
  const points = values.map((v, i) => `${i * w},${100 - ((v - min) / range) * 80}`).join(' ');
  return (
    <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: '100%', height: '3rem' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const DashboardSection: React.FC = () => (
  <>
    <DemoLabel>Dashboard — stat row + feature area + activity list</DemoLabel>
    <div className="flex flex-col gap-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Total snippets" value="2,841"  delta="12% this week"  positive />
        <StatCard label="Languages"      value="34"     delta="2 new"          positive />
        <StatCard label="Avg. length"    value="64 ln"  delta="3 ln longer"    positive={false} />
        <StatCard label="Saved"          value="192"    delta="8% this week"   positive />
      </div>

      {/* Feature row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.25rem',
        }}
      >
        {/* Chart area */}
        <GlassPanel intensity="medium" topGlow rounded="rounded-[1.6rem]" className="p-6">
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
                  Snippets added
                </p>
                <p className="mt-0.5 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
                  Past 12 weeks
                </p>
              </div>
              <GlassPill size="xs">Export</GlassPill>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {[18, 32, 24, 41, 35, 58, 44, 62, 49, 73, 68, 84].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${(h / 84) * 100}%`,
                    background: i === 11
                      ? 'linear-gradient(to top, oklch(0.52 0.24 238 / 0.70), oklch(0.72 0.14 226 / 0.50))'
                      : 'oklch(0.52 0.24 238 / 0.22)',
                    borderRadius: '3px 3px 0 0',
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.52rem] text-[var(--color-text-subtle)]">
              <span>12 wks ago</span>
              <span>This week</span>
            </div>
          </div>
        </GlassPanel>

        {/* Activity list */}
        <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.6rem]" className="p-5">
          <div className="relative z-10">
            <p className="mb-4 text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
              Recent activity
            </p>
            <div className="space-y-1">
              {[
                { action: 'Created', name: 'debounce.ts',      lang: 'TS',  time: '2m ago' },
                { action: 'Edited',  name: 'sql-join.sql',     lang: 'SQL', time: '14m ago' },
                { action: 'Saved',   name: 'flex-center.css',  lang: 'CSS', time: '1h ago' },
                { action: 'Created', name: 'binary-search.py', lang: 'PY',  time: '3h ago' },
                { action: 'Deleted', name: 'old-helper.js',    lang: 'JS',  time: '5h ago' },
              ].map(({ action, name, lang, time }) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-[0.8rem] px-3 py-2 transition-colors duration-200 hover:bg-[oklch(0.52_0.24_238_/_0.06)]"
                >
                  <span
                    className="flex-none rounded text-[0.48rem] font-bold px-1.5 py-0.5"
                    style={{
                      background: 'oklch(0.52 0.24 238 / 0.14)',
                      color: 'var(--color-accent-bright)',
                      border: '1px solid oklch(0.52 0.24 238 / 0.20)',
                      minWidth: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    {lang}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.68rem] text-[var(--color-text)]">{name}</p>
                    <p className="text-[0.56rem] text-[var(--color-text-subtle)]">{action}</p>
                  </div>
                  <p className="flex-none text-[0.56rem] text-[var(--color-text-subtle)]">{time}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Bottom row — sparklines */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'TypeScript', data: [12,18,14,22,19,28,24,31,27,38,34,42], color: 'oklch(0.72 0.14 226)' },
          { label: 'Python',     data: [8,11,9,15,13,18,16,22,20,25,23,28],  color: 'oklch(0.76 0.16 160)' },
          { label: 'Rust',       data: [3,5,4,7,6,9,8,12,10,14,13,16],       color: 'oklch(0.78 0.13 38)' },
        ].map(({ label, data, color }) => (
          <GlassPanel key={label} intensity="subtle" topGlow={false} rounded="rounded-[1.4rem]" className="p-5">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">{label}</p>
                <p className="font-[var(--font-display)] text-lg font-[200] tracking-[-0.03em]" style={{ color }}>{data[data.length - 1]}</p>
              </div>
              <MiniSparkline values={data} color={color} />
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>

    <CodeBlock>{`{/* Dashboard — stat row + feature area + list */}
<div className="flex flex-col gap-5">
  {/* 4-column stat row — collapses to 2 on mobile */}
  <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
    {stats.map((s) => <StatCard key={s.label} {...s} />)}
  </div>

  {/* Feature row — fluid chart + fixed list */}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
    <GlassPanel intensity="medium" …>Chart</GlassPanel>
    <GlassPanel intensity="subtle" …>Activity</GlassPanel>
  </div>

  {/* Sparkline row — equal 3-column */}
  <div className="grid grid-cols-3 gap-5">
    {languages.map((lang) => <SparkCard key={lang.label} {...lang} />)}
  </div>
</div>`}</CodeBlock>
  </>
);

// ── § Stacking & depth ────────────────────────────────────────────────────────

const StackingSection: React.FC = () => (
  <>
    <DemoLabel>Layered depth — panels stacked with z-index and negative margin</DemoLabel>
    <div className="relative" style={{ height: '340px' }}>
      {/* Rearmost */}
      <GlassPanel
        intensity="subtle"
        topGlow={false}
        rounded="rounded-[2rem]"
        className="absolute"
        style={{ inset: 0, zIndex: 1 }}
      >
        <div className="relative z-10 p-8">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
            Layer 1 — rearmost (<Code>z-index: 1</Code>)
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">intensity="subtle"</p>
        </div>
      </GlassPanel>

      {/* Middle */}
      <GlassPanel
        intensity="medium"
        topGlow
        rounded="rounded-[1.8rem]"
        className="absolute"
        style={{ top: '2.5rem', left: '3rem', right: '3rem', bottom: '2.5rem', zIndex: 2 }}
      >
        <div className="relative z-10 p-7">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
            Layer 2 — middle (<Code>z-index: 2</Code>)
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">intensity="medium" — inset 2.5rem</p>
        </div>
      </GlassPanel>

      {/* Foremost */}
      <GlassPanel
        intensity="strong"
        topGlow
        bottomGlow
        rounded="rounded-[1.4rem]"
        className="absolute"
        style={{ top: '5rem', left: '6rem', right: '6rem', bottom: '5rem', zIndex: 3 }}
      >
        <div className="relative z-10 p-6 flex flex-col items-center justify-center h-full text-center">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
            Layer 3 — foreground (<Code>z-index: 3</Code>)
          </p>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
            intensity="strong"
          </p>
          <p className="mt-2 text-[0.68rem] text-[var(--color-text-muted)]">Inset 5rem on all sides</p>
        </div>
      </GlassPanel>
    </div>

    <GlassDivider className="my-8" />

    <DemoLabel>Float card — panel elevated above a background</DemoLabel>
    <div
      className="relative rounded-[2rem] overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '280px',
        background: 'linear-gradient(135deg, oklch(0.12 0.04 250) 0%, oklch(0.10 0.06 220) 100%)',
      }}
    >
      {/* Ambient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 30%, oklch(0.52 0.24 238 / 0.25), transparent 55%)',
            'radial-gradient(ellipse 50% 40% at 80% 70%, oklch(0.58 0.14 210 / 0.20), transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Floating card */}
      <GlassPanel
        intensity="strong"
        topGlow
        bottomGlow
        rounded="rounded-[1.8rem]"
        className="relative w-72 p-7"
        style={{
          boxShadow: '0 32px 80px oklch(0.05 0.02 250 / 0.55), 0 8px 24px oklch(0.05 0.02 250 / 0.30)',
        }}
      >
        <div className="relative z-10">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">Floating card</p>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-[200] tracking-[-0.04em] text-[var(--color-text)] text-bevel-strong">
            Elevated glass
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Deep shadow intensifies the illusion of elevation above a textured background.
          </p>
          <div className="mt-5">
            <GlassPill size="sm" variant="accent" className="w-full justify-center">
              Call to action
            </GlassPill>
          </div>
        </div>
      </GlassPanel>
    </div>

    <CodeBlock>{`{/* Layered stacking via absolute positioning */}
<div className="relative" style={{ height: '340px' }}>
  <GlassPanel intensity="subtle"  style={{ position:'absolute', inset: 0,       zIndex: 1 }} … />
  <GlassPanel intensity="medium"  style={{ position:'absolute', inset: '2.5rem', zIndex: 2 }} … />
  <GlassPanel intensity="strong"  style={{ position:'absolute', inset: '5rem',   zIndex: 3 }} … />
</div>

{/* Floating card — amplified box-shadow for elevation */}
<GlassPanel
  intensity="strong"
  style={{
    boxShadow: '0 32px 80px oklch(0.05 0.02 250 / 0.55), 0 8px 24px oklch(0.05 0.02 250 / 0.30)',
  }}
  …
/>`}</CodeBlock>
  </>
);

// ── § GlassProvider scoping ───────────────────────────────────────────────────

const ProviderScopingSection: React.FC = () => {
  const [outerOpacity, setOuterOpacity] = useState(0.50);
  const [innerOpacity, setInnerOpacity] = useState(0.80);

  return (
    <>
      <DemoLabel>Nested GlassProvider — per-region opacity overrides</DemoLabel>
      <p className="mb-5 text-[0.72rem] leading-6 text-[var(--color-text-muted)]">
        Wrap layout regions in a <Code>{'<GlassProvider>'}</Code> to override glass properties
        for that subtree only — useful for modals, sidebars, or sections that need different depth.
      </p>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-8">
        <div>
          <p className="mb-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
            Outer opacity — <span className="text-[var(--color-accent-bright)]">{outerOpacity}</span>
          </p>
          <input type="range" min={0.20} max={1} step={0.05} value={outerOpacity}
            onChange={(e) => setOuterOpacity(Number(e.target.value))}
            className="accent-[var(--color-accent)]" />
        </div>
        <div>
          <p className="mb-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-subtle)]">
            Inner opacity — <span className="text-[var(--color-accent-bright)]">{innerOpacity}</span>
          </p>
          <input type="range" min={0.20} max={1} step={0.05} value={innerOpacity}
            onChange={(e) => setInnerOpacity(Number(e.target.value))}
            className="accent-[var(--color-accent)]" />
        </div>
      </div>

      <GlassProvider opacity={outerOpacity}>
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Outer region */}
          <GlassPanel intensity="medium" topGlow rounded="rounded-[1.6rem]" className="p-6">
            <div className="relative z-10">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
                Outer region
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">
                Inherits <Code>opacity={outerOpacity}</Code> from the outer provider.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1rem]" className="p-3">
                  <p className="relative z-10 text-[0.56rem] text-[var(--color-text-subtle)]">subtle</p>
                </GlassPanel>
                <GlassPanel intensity="strong" topGlow={false} rounded="rounded-[1rem]" className="p-3">
                  <p className="relative z-10 text-[0.56rem] text-[var(--color-text-subtle)]">strong</p>
                </GlassPanel>
              </div>
            </div>
          </GlassPanel>

          {/* Inner region — different provider */}
          <GlassProvider opacity={innerOpacity}>
            <GlassPanel intensity="medium" topGlow rounded="rounded-[1.6rem]" className="p-6 h-full">
              <div className="relative z-10">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
                  Inner region
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">
                  Overridden with <Code>opacity={innerOpacity}</Code> via nested provider.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1rem]" className="p-3">
                    <p className="relative z-10 text-[0.56rem] text-[var(--color-text-subtle)]">subtle</p>
                  </GlassPanel>
                  <GlassPanel intensity="strong" topGlow={false} rounded="rounded-[1rem]" className="p-3">
                    <p className="relative z-10 text-[0.56rem] text-[var(--color-text-subtle)]">strong</p>
                  </GlassPanel>
                </div>
              </div>
            </GlassPanel>
          </GlassProvider>
        </div>
      </GlassProvider>

      <CodeBlock>{`{/* Outer page — default or top-level opacity */}
<GlassProvider opacity={0.50}>
  <GlassPanel intensity="medium" …>
    Main layout region
  </GlassPanel>

  {/* Modal / sidebar with higher opacity override */}
  <GlassProvider opacity={0.80}>
    <GlassPanel intensity="strong" …>
      Elevated surface — inherits the nested provider's opacity
    </GlassPanel>
  </GlassProvider>
</GlassProvider>`}</CodeBlock>
    </>
  );
};

// ── § Gap scale ───────────────────────────────────────────────────────────────

const GAP_OPTIONS = [
  { label: 'tight', value: '0.5rem',  tw: 'gap-2' },
  { label: 'cozy',  value: '1rem',    tw: 'gap-4' },
  { label: 'base',  value: '1.25rem', tw: 'gap-5' },
  { label: 'loose', value: '2rem',    tw: 'gap-8' },
  { label: 'airy',  value: '3rem',    tw: 'gap-12' },
];

const GapSection: React.FC = () => {
  const [activeGap, setActiveGap] = useState('1.25rem');

  return (
    <>
      <DemoLabel>Gap scale — spacing between glass panels</DemoLabel>
      <p className="mb-4 text-[0.72rem] leading-6 text-[var(--color-text-muted)]">
        Gap controls breathing room between panels. Tighter grids feel data-dense; looser ones
        feel editorial. Glass panels need enough gap so their corner glows don't bleed together.
      </p>

      {/* Gap picker */}
      <div className="mb-5 flex flex-wrap gap-2">
        {GAP_OPTIONS.map(({ label, value, tw }) => (
          <GlassPill
            key={value}
            size="sm"
            variant={activeGap === value ? 'active' : 'default'}
            onClick={() => setActiveGap(value)}
          >
            {label} — {tw}
          </GlassPill>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: activeGap,
          transition: 'gap 300ms ease',
        }}
      >
        {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map((name) => (
          <Plate key={name} label={name} intensity="subtle" topGlow={false} />
        ))}
      </div>

      <p className="mt-4 text-[0.68rem] leading-5 text-[var(--color-text-muted)]">
        Current gap: <Code>{activeGap}</Code> — {GAP_OPTIONS.find(g => g.value === activeGap)?.tw}
      </p>

      <CodeBlock>{`{/* Recommended minimum gap for glass panels: gap-5 (1.25rem) */}
{/* Smaller gaps risk corner glows merging across panel edges */}
<div className="grid grid-cols-3 gap-5">  {/* ← cozy default */}
  {items.map((item) => <GlassPanel key={item.id} … />)}
</div>

<div className="grid grid-cols-3 gap-8">  {/* ← editorial / hero */}
  {items.map((item) => <GlassPanel key={item.id} … />)}
</div>`}</CodeBlock>
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'column-grid',    label: 'Column Grid' },
  { id: 'bento',         label: 'Bento' },
  { id: 'sidebar',       label: 'Sidebar' },
  { id: 'dashboard',     label: 'Dashboard' },
  { id: 'stacking',      label: 'Stacking' },
  { id: 'provider-scope', label: 'Provider scope' },
  { id: 'gap-scale',     label: 'Gap scale' },
];

const LayoutShowcase: React.FC = () => (
  <div
    className="mx-auto"
    style={{ maxWidth: '72rem', padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,3rem) 8rem' }}
  >
    {/* Page header */}
    <div className="mb-20">
      <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.44em] text-[var(--color-text-subtle)] text-bevel">
        Glass Design System
      </p>
      <h1 className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-[200] leading-[0.90] tracking-[-0.07em] text-[var(--color-text)] text-bevel-strong">
        Layouts
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-muted)] text-bevel">
        Glass panels are layout-agnostic — they adapt to any CSS grid or flexbox arrangement. This
        page demonstrates canonical layout patterns, the grid system, gap scale, depth stacking, and
        how <Code>GlassProvider</Code> scoping enables per-region opacity overrides.
      </p>

      {/* Quick nav */}
      <div className="mt-8 flex flex-wrap gap-2">
        {NAV_ITEMS.map(({ id, label }) => (
          <GlassPill key={id} size="sm" as="a" href={`#${id}`}>
            {label}
          </GlassPill>
        ))}
      </div>
    </div>

    <GlassDivider className="mb-20" />

    {/* ── Column Grid */}
    <PageSection id="column-grid">
      <SectionLabel>Grid system</SectionLabel>
      <SectionTitle>Column Grid</SectionTitle>
      <SectionSub>
        Equal-width, asymmetric, and fluid auto-fill grids. Use Tailwind's{' '}
        <Code>grid-cols-N</Code> classes for fixed columns and CSS{' '}
        <Code>repeat(auto-fill, minmax(...))</Code> for fully responsive layouts with no
        breakpoints.
      </SectionSub>
      <GlassDivider className="my-10" />
      <ColumnGridSection />
    </PageSection>

    {/* ── Bento */}
    <PageSection id="bento">
      <SectionLabel>Grid system</SectionLabel>
      <SectionTitle>Bento Grid</SectionTitle>
      <SectionSub>
        A magazine-style mosaic where panels span multiple columns and rows.
        Use <Code>grid-column: span N</Code> and <Code>grid-row: span N</Code> to create
        visual hierarchy without breaking out of the grid.
      </SectionSub>
      <GlassDivider className="my-10" />
      <BentoSection />
    </PageSection>

    {/* ── Sidebar */}
    <PageSection id="sidebar">
      <SectionLabel>Layout pattern</SectionLabel>
      <SectionTitle>Sidebar Layout</SectionTitle>
      <SectionSub>
        A fixed-width navigation sidebar paired with a fluid main area and topbar.
        The sidebar spans both grid rows via <Code>grid-row: span 2</Code> — no extra
        wrappers needed.
      </SectionSub>
      <GlassDivider className="my-10" />
      <SidebarSection />
    </PageSection>

    {/* ── Dashboard */}
    <PageSection id="dashboard">
      <SectionLabel>Layout pattern</SectionLabel>
      <SectionTitle>Dashboard</SectionTitle>
      <SectionSub>
        A realistic analytics dashboard composing stat cards, a chart area, an activity
        feed, and sparkline cards — each row using a different grid proportion.
      </SectionSub>
      <GlassDivider className="my-10" />
      <DashboardSection />
    </PageSection>

    {/* ── Stacking */}
    <PageSection id="stacking">
      <SectionLabel>Depth & composition</SectionLabel>
      <SectionTitle>Stacking & Depth</SectionTitle>
      <SectionSub>
        Glass panels gain physical depth when layered. Use <Code>position: absolute</Code> and
        incrementing <Code>z-index</Code> values with inset offsets to create a sense of
        dimension — stronger <Code>intensity</Code> values should sit in front.
      </SectionSub>
      <GlassDivider className="my-10" />
      <StackingSection />
    </PageSection>

    {/* ── Provider scope */}
    <PageSection id="provider-scope">
      <SectionLabel>Configuration</SectionLabel>
      <SectionTitle>Provider Scope</SectionTitle>
      <SectionSub>
        Nest a <Code>{'<GlassProvider>'}</Code> around any layout region to locally override{' '}
        <Code>opacity</Code>, <Code>blur</Code>, or light/shadow alpha — without affecting
        sibling regions. Useful for modals, sidebars, and hero sections that need different depth.
      </SectionSub>
      <GlassDivider className="my-10" />
      <ProviderScopingSection />
    </PageSection>

    {/* ── Gap scale */}
    <PageSection id="gap-scale">
      <SectionLabel>Grid system</SectionLabel>
      <SectionTitle>Gap Scale</SectionTitle>
      <SectionSub>
        Spacing between glass panels is part of the design. Too tight and the corner
        glows bleed together; too loose and the grid loses cohesion. The recommended
        default is <Code>gap-5</Code> (1.25rem).
      </SectionSub>
      <GlassDivider className="my-10" />
      <GapSection />
    </PageSection>

    {/* Footer */}
    <GlassDivider className="mb-16" />
    <div className="flex flex-wrap items-center justify-between gap-4 pb-16">
      <p className="text-[0.62rem] text-[var(--color-text-subtle)]">
        Glass Design System — layout patterns
      </p>
      <div className="flex gap-2">
        <GlassPill size="xs" as={Link} to="/">Showcase</GlassPill>
        <GlassPill size="xs" as={Link} to="/components">Components</GlassPill>
        <GlassPill size="xs" as={Link} to="/product">Product demo</GlassPill>
      </div>
    </div>
  </div>
);

export default LayoutShowcase;
