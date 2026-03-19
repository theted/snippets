import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, GlassPill, GlassDivider, GlassProvider } from 'glass-design-system';

// ── Hero ─────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => (
  <section
    className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
  >
    {/* Ambient orbs */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: [
          'radial-gradient(ellipse 70% 50% at 30% 20%, oklch(0.52 0.24 238 / 0.22), transparent 60%)',
          'radial-gradient(ellipse 60% 40% at 75% 75%, oklch(0.58 0.14 210 / 0.18), transparent 55%)',
        ].join(', '),
      }}
    />

    <div className="relative z-10 mx-auto max-w-4xl">
      <p
        className="text-[0.72rem] font-semibold uppercase tracking-[0.44em] text-bevel"
        style={{ color: 'var(--color-accent-bright)' }}
      >
        Glass Design System
      </p>
      <h1
        className="mt-4 font-[var(--font-display)] text-[clamp(3.5rem,10vw,8rem)] font-[200] leading-[0.88] tracking-[-0.07em] text-bevel-strong"
        style={{ color: 'var(--color-text)' }}
      >
        Build faster.
        <br />
        <span style={{ color: 'var(--color-accent-bright)' }}>Ship glass.</span>
      </h1>
      <p
        className="mx-auto mt-8 max-w-xl text-base leading-7"
        style={{ color: 'var(--color-text-muted)' }}
      >
        The glass design system for teams who care about craft.
        Components that bend light, not rules.
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <GlassPill size="lg" variant="accent">Start free</GlassPill>
        <GlassPill size="lg">View docs</GlassPill>
      </div>
    </div>

    {/* Scroll indicator */}
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      style={{ animation: 'bounce 2s infinite' }}
      aria-hidden="true"
    >
      <span style={{ color: 'var(--color-text-subtle)', fontSize: '1.2rem' }}>↓</span>
    </div>

    <style>{`
      @keyframes bounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(8px); }
      }
    `}</style>
  </section>
);

// ── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '◐',
    title: 'One light source',
    body: 'Glass adapts to any background through a single coherent lighting model. The cursor becomes the sun.',
  },
  {
    icon: '⊛',
    title: 'Two knobs, infinite range',
    body: 'Blur and opacity master controls cascade through every component. Retheme the whole system in two lines.',
  },
  {
    icon: '⌥',
    title: 'Zero abstraction overhead',
    body: 'React components that map directly to CSS backdrop-filter primitives. What you write is what renders.',
  },
];

const Features: React.FC = () => (
  <section className="mx-auto max-w-6xl px-6 py-24">
    <div className="mb-14">
      <p
        className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-bevel"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        Capabilities
      </p>
      <h2
        className="mt-3 font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-[250] tracking-[-0.055em] text-bevel-strong"
        style={{ color: 'var(--color-text)' }}
      >
        Everything you need.
      </h2>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {FEATURES.map((f) => (
        <GlassPanel key={f.title} intensity="subtle" topGlow className="p-8">
          <div className="relative z-10">
            <span
              className="block text-3xl"
              style={{ color: 'var(--color-accent-bright)' }}
              aria-hidden="true"
            >
              {f.icon}
            </span>
            <h3
              className="mt-5 font-[var(--font-display)] text-xl font-[300] tracking-[-0.04em] text-bevel-strong"
              style={{ color: 'var(--color-text)' }}
            >
              {f.title}
            </h3>
            <p
              className="mt-3 text-sm leading-7"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {f.body}
            </p>
          </div>
        </GlassPanel>
      ))}
    </div>
  </section>
);

// ── Pricing ───────────────────────────────────────────────────────────────────

type PlanProps = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  intensity: 'subtle' | 'medium' | 'strong';
  accent?: boolean;
  badge?: string;
};

const Plan: React.FC<PlanProps> = ({ name, tagline, price, period, features, cta, intensity, accent, badge }) => (
  <GlassPanel intensity={intensity} topGlow bottomGlow={intensity === 'strong'} className="relative flex flex-col p-8">
    <div className="relative z-10 flex-1">
      {badge && (
        <div className="mb-4">
          <GlassPill size="xs" variant="accent">{badge}</GlassPill>
        </div>
      )}
      <p
        className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-bevel"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        {name}
      </p>
      <p
        className="mt-1 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {tagline}
      </p>
      <div className="mt-6 flex items-baseline gap-1">
        <span
          className="font-[var(--font-display)] text-4xl font-[200] tracking-[-0.05em] text-bevel-strong"
          style={{ color: 'var(--color-text)' }}
        >
          {price}
        </span>
        <span style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem' }}>{period}</span>
      </div>

      <GlassDivider className="my-6" />

      <ul className="space-y-3">
        {features.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>✓</span>
            {feat}
          </li>
        ))}
      </ul>
    </div>

    <div className="relative z-10 mt-8">
      <GlassPill size="md" variant={accent ? 'accent' : 'default'} className="w-full justify-center">
        {cta}
      </GlassPill>
    </div>
  </GlassPanel>
);

const PLANS: PlanProps[] = [
  {
    name: 'Free',
    tagline: 'For hobbyists',
    price: '$0',
    period: '/mo',
    features: ['3 projects', 'Community support', 'Core components'],
    cta: 'Get started',
    intensity: 'subtle',
  },
  {
    name: 'Pro',
    tagline: 'For professionals',
    price: '$29',
    period: '/mo',
    features: ['Unlimited projects', 'Priority support', 'Full component library', 'Design tokens export'],
    cta: 'Start free trial',
    intensity: 'strong',
    accent: true,
    badge: 'Most popular',
  },
  {
    name: 'Team',
    tagline: 'For studios',
    price: '$99',
    period: '/mo',
    features: ['Everything in Pro', 'Team management', 'Custom themes', 'SLA guarantee'],
    cta: 'Contact sales',
    intensity: 'subtle',
  },
];

const Pricing: React.FC = () => (
  <section className="mx-auto max-w-6xl px-6 py-24">
    <div className="mb-14">
      <p
        className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-bevel"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        Pricing
      </p>
      <h2
        className="mt-3 font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-[250] tracking-[-0.055em] text-bevel-strong"
        style={{ color: 'var(--color-text)' }}
      >
        Simple pricing.
      </h2>
    </div>

    {/* Nested GlassProvider — tighter blur on this section to demonstrate nested config */}
    <GlassProvider blur={32} opacity={0.58}>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Plan key={plan.name} {...plan} />
        ))}
      </div>
    </GlassProvider>

    <p
      className="mt-6 text-center text-xs"
      style={{ color: 'var(--color-text-subtle)' }}
    >
      Pricing cards use{' '}
      <code className="font-[var(--font-code)] text-[0.72em]" style={{ color: 'var(--color-accent-bright)' }}>
        {'<GlassProvider blur={32} opacity={0.58}>'}
      </code>
      {' '}— nested provider with tighter blur to contrast with the rest of the page.
    </p>
  </section>
);

// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    initials: 'AK',
    quote: 'The glass system is the first design system that actually makes me excited to build UI.',
    name: 'Alex K.',
    role: 'Lead Designer @ Vercel',
  },
  {
    initials: 'ML',
    quote: 'Two knobs. Infinite expressiveness. It just works.',
    name: 'Maria L.',
    role: 'Frontend Engineer @ Linear',
  },
  {
    initials: 'ST',
    quote: 'We redesigned our entire dashboard in a weekend.',
    name: 'Sam T.',
    role: 'CTO @ Raycast',
  },
];

const Testimonials: React.FC = () => (
  <section className="mx-auto max-w-6xl px-6 py-24">
    <div className="mb-14">
      <p
        className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-bevel"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        Social proof
      </p>
      <h2
        className="mt-3 font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-[250] tracking-[-0.055em] text-bevel-strong"
        style={{ color: 'var(--color-text)' }}
      >
        Loved by designers.
      </h2>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <GlassPanel key={t.name} intensity="subtle" className="p-7">
          <div className="relative z-10">
            <GlassPill size="sm" variant="accent" as="span">{t.initials}</GlassPill>
            <GlassDivider className="my-5" />
            <p
              className="text-sm leading-7 text-bevel"
              style={{ color: 'var(--color-text-muted)' }}
            >
              "{t.quote}"
            </p>
            <div className="mt-5">
              <p
                className="text-[0.72rem] font-semibold text-bevel"
                style={{ color: 'var(--color-text)' }}
              >
                {t.name}
              </p>
              <p
                className="text-[0.68rem]"
                style={{ color: 'var(--color-text-subtle)' }}
              >
                {t.role}
              </p>
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  </section>
);

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Does it work with any background?',
    a: 'Yes. The system is background-agnostic. The glass adapts to the colours behind it through backdrop-filter — it samples and blurs whatever is rendered beneath.',
  },
  {
    q: 'Is it accessible?',
    a: 'Yes. All components support keyboard navigation, visible focus rings, and proper ARIA semantics. The design system adds visual polish without removing accessibility.',
  },
  {
    q: 'Can I publish it as an npm package?',
    a: 'It ships as an ES module with full TypeScript declarations. Add it to any React 19+ project with a single import.',
  },
  {
    q: "What's the license?",
    a: 'MIT. Use it commercially, modify it, redistribute it.',
  },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <GlassPanel intensity="medium" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative z-10 flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <span
          className="font-[var(--font-display)] text-base font-[300] tracking-[-0.02em] text-bevel"
          style={{ color: 'var(--color-text)' }}
        >
          {q}
        </span>
        <span
          className="shrink-0 text-lg transition-transform duration-300"
          style={{
            color: 'var(--color-text-subtle)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        >
          ↓
        </span>
      </button>
      {open && (
        <div className="relative z-10 px-6 pb-6">
          {/* Nested glass for the expanded answer panel */}
          <GlassPanel intensity="subtle" rounded="rounded-[1.2rem]" className="p-5" topGlow={false}>
            <p
              className="relative z-10 text-sm leading-7"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {a}
            </p>
          </GlassPanel>
        </div>
      )}
    </GlassPanel>
  );
};

const FAQ: React.FC = () => (
  <section className="mx-auto max-w-3xl px-6 py-24">
    <div className="mb-14">
      <p
        className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-bevel"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        Questions
      </p>
      <h2
        className="mt-3 font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-[250] tracking-[-0.055em] text-bevel-strong"
        style={{ color: 'var(--color-text)' }}
      >
        Got questions?
      </h2>
    </div>

    <div className="space-y-3">
      {FAQS.map((faq) => (
        <FaqItem key={faq.q} {...faq} />
      ))}
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer className="mx-auto max-w-6xl px-6 pb-12">
    <GlassDivider className="mb-8" />
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <p
        className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-bevel"
        style={{ color: 'var(--color-text-subtle)' }}
      >
        Glass Design System © {new Date().getFullYear()}
      </p>
      <div className="flex items-center gap-2">
        <GlassPill size="xs" as="a" href="#" rel="noopener noreferrer">GitHub</GlassPill>
        <GlassPill size="xs" as="a" href="#" rel="noopener noreferrer">Twitter</GlassPill>
        <GlassPill size="xs" as="a" href="#" rel="noopener noreferrer">Discord</GlassPill>
      </div>
    </div>
  </footer>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const ProductDemo: React.FC = () => (
  <div>
    <Hero />
    <Features />
    <Pricing />
    <Testimonials />
    <FAQ />
    <Footer />
  </div>
);

export default ProductDemo;
