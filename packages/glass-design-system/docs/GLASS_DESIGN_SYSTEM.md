# Glass Design System

A frosted-glass UI language for dark, depth-rich interfaces. Every surface in this app — cards, modals, toasts, navigation bars, form fields — is a single coherent material governed by two master knobs.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Architecture overview](#2-architecture-overview)
3. [Master knobs](#3-master-knobs)
4. [Design tokens (CSS variables)](#4-design-tokens-css-variables)
5. [Intensity tiers](#5-intensity-tiers)
6. [`getGlassStyles()` API](#6-getglassstyles-api)
7. [`<GlassPanel>` component](#7-glasspanel-component)
8. [Anatomy of a glass surface](#8-anatomy-of-a-glass-surface)
9. [Tinted glass](#9-tinted-glass)
10. [Backdrop & background requirements](#10-backdrop--background-requirements)
11. [Typography utilities](#11-typography-utilities)
12. [Interactive effects](#12-interactive-effects)
13. [Nesting & depth hierarchy](#13-nesting--depth-hierarchy)
14. [Snippet card: manual glass pattern](#14-snippet-card-manual-glass-pattern)
15. [Do's and don'ts](#15-dos-and-donts)
16. [Global retheme recipe](#16-global-retheme-recipe)

---

## 1. Philosophy

Six principles drive every design decision:

**One light source.** Every panel behaves as if lit from the upper-right. The top-edge shimmer line, the corner glow, and the inset box-shadow all point toward the same imaginary origin — layering panels never creates contradictory lighting.

**Background is content.** Glass works because what's behind the panel is intentionally beautiful. The frosted blur turns the dark gradient and ambient orbs into an abstract texture. The panel doesn't hide its context; it frames it.

**Two knobs, infinite surface.** `GLASS_OPACITY` and `GLASS_BLUR` are the only global controls. Every surface is a multiplier of those two values. Tune them once and the entire UI shifts in unison.

**Depth through opacity.** Panels closer to the user (modals, popovers) use `'strong'` intensity. Background panels use `'subtle'`. This creates a natural focus hierarchy without resorting to drop shadows alone.

**Colour as atmosphere.** Tinted glass is not branding — it's emotional temperature. Blue is neutral and analytical. Amber signals caution. Emerald signals life. Tints are applied as `screen`-blend washes, never flat fills, so the texture stays intact.

**Motion reinforces material.** The mouse-tracking radial gradient inside each panel simulates specular reflection. GSAP handles panel entrances and exits so the glass feels like it has physical weight.

---

## 2. Architecture overview

```
src/
├── index.css               ← CSS custom properties (design tokens), text-bevel utilities
├── design/
│   └── glass.ts            ← Master knobs, per-intensity alpha tables, getGlassStyles()
└── components/
    └── GlassPanel.tsx      ← React component — the primary API for new surfaces
```

The flow is:

```
index.css tokens
    ↓
glass.ts master knobs → getGlassStyles(intensity) → inline style object
    ↓
GlassPanel.tsx (or manual pattern in Snippet.tsx)
```

---

## 3. Master knobs

Defined in `src/design/glass.ts`. Edit these values to retheme every glass surface simultaneously.

| Knob | Current value | Effect |
|------|--------------|--------|
| `GLASS_OPACITY` | `0.66` | Background alpha multiplier. Lower = more transparent / more glass-like. Range: 0–1. |
| `GLASS_BLUR` | `40px` | `backdrop-filter: blur(...)`. Higher = blurrier / more frosted. |
| `GLASS_LIGHT_ALPHA` | `0.22` | Intensity of the screen-blend specular wash that follows the cursor on hover. |
| `GLASS_SHADOW_ALPHA` | `0.20` | Intensity of the darkening gradient on the side away from the cursor. |

Every per-intensity alpha is stored as a *base* value. At runtime, `getGlassStyles()` multiplies each base against `GLASS_OPACITY` using the helper `a(base)`:

```ts
function a(base: number): string {
  return (Math.round(base * GLASS_OPACITY * 1000) / 1000).toFixed(3);
}
```

This means proportional relationships between intensity tiers are always preserved — making `GLASS_OPACITY` a true global multiplier.

---

## 4. Design tokens (CSS variables)

Defined in `:root` in `src/index.css`.

### Colour palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `oklch(0.12 0.030 246)` | Page background base |
| `--color-bg-deep` | `oklch(0.08 0.022 248)` | Gradient end; deepest background |
| `--color-surface` | `oklch(0.23 0.03 254 / 0.76)` | Standard interactive surface |
| `--color-surface-strong` | `oklch(0.27 0.04 252 / 0.9)` | Elevated or active state |
| `--color-surface-muted` | `oklch(0.2 0.024 254 / 0.82)` | Subdued surface; button resting state |
| `--color-border` | `oklch(0.4 0.044 248 / 0.38)` | Default border |
| `--color-border-strong` | `oklch(0.69 0.13 240 / 0.42)` | Focus / active border |
| `--color-accent` | `oklch(0.71 0.17 244)` | Primary accent (blue) |
| `--color-accent-bright` | `oklch(0.79 0.14 226)` | Brighter accent for highlights and code |
| `--color-accent-soft` | `oklch(0.72 0.14 236 / 0.18)` | Accent tint; focus rings |
| `--color-text` | `oklch(0.98 0.006 255)` | Primary text |
| `--color-text-muted` | `oklch(0.82 0.025 255)` | Secondary text |
| `--color-text-subtle` | `oklch(0.65 0.04 252)` | Tertiary / label text |
| `--color-success` | `oklch(0.76 0.16 160)` | Green |
| `--color-warning` | `oklch(0.8 0.13 88)` | Amber |
| `--color-danger` | `oklch(0.65 0.19 25)` | Red |
| `--color-ink` | `oklch(0.2 0.02 255)` | Dark text on light surfaces |

### Glass-specific surface tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-glass-card` | `oklch(0.2 0.025 254 / 0.46)` | Snippet card background |
| `--color-glass-row` | `oklch(0.2 0.024 254 / 0.42)` | Table / list row background |
| `--color-glass-field` | `oklch(0.15 0.018 258 / 0.55)` | Form field background |

> `--color-glass-card` is synchronized with `GLASS_OPACITY` via `CARD_BG_ALPHA` in `glass.ts` — edit the master knob and the card alpha follows.

### Typography

| Token | Stack |
|-------|-------|
| `--font-display` | `'Manrope'`, Avenir Next, Segoe UI Variable |
| `--font-body` | `'Space Grotesk'`, Avenir Next, Segoe UI Variable |
| `--font-code` | `'JetBrains Mono'`, SFMono-Regular, Cascadia Code, Fira Code |

---

## 5. Intensity tiers

Each `GlassPanel` picks one of three intensities. All alphas scale against `GLASS_OPACITY`.

| Intensity | Background alpha (base) | Border alpha | Use case |
|-----------|------------------------|-------------|----------|
| `'subtle'` | `0.17` | `0.20` | Airy cards, inset panels, nested containers behind foreground content |
| `'medium'` | `0.30` | `0.32` | **Default.** Standard cards, navigation bars, sidebars |
| `'strong'` | `0.64` | `0.44` | Modals, dialogs, elevated popovers, form panels in focus |

The internal tables in `glass.ts`:

```ts
const BASE_BG:      Record<GlassIntensity, number> = { subtle: 0.17, medium: 0.30, strong: 0.64 };
const BASE_BORDER:  Record<GlassIntensity, number> = { subtle: 0.20, medium: 0.32, strong: 0.44 };
const BASE_SHIMMER: Record<GlassIntensity, number> = { subtle: 0.24, medium: 0.38, strong: 0.64 };
const BASE_SHADOW:  Record<GlassIntensity, number> = { subtle: 0.20, medium: 0.34, strong: 0.46 };
const BASE_GLOW:    Record<GlassIntensity, number> = { subtle: 0.07, medium: 0.10, strong: 0.13 };
```

---

## 6. `getGlassStyles()` API

```ts
import { getGlassStyles, GlassIntensity } from '../design/glass';

const glass = getGlassStyles('medium'); // or 'subtle' | 'strong'
```

Returns a `GlassStyles` object:

```ts
interface GlassStyles {
  panel: {
    background:     string; // oklch background with computed alpha
    backdropFilter: string; // blur(${GLASS_BLUR}px)
    border:         string; // 1px solid oklch edge
    boxShadow:      string; // outer depth shadow + inset shimmer
  };
  shimmerColor:   string;  // top-edge 1px gradient colour
  topRightGlow: {
    background: string;    // radial-gradient for upper-right blue glow
    filter:     string;    // blur for the glow div
  };
  bottomLeftGlow: {
    background: string;    // radial-gradient for lower-left teal glow
    filter:     string;
  };
}
```

Apply directly to a `div`:

```tsx
const glass = getGlassStyles('medium');

<div style={glass.panel} className="relative overflow-hidden rounded-[2rem]">
  {/* top-edge shimmer */}
  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
    style={{ background: `linear-gradient(90deg, transparent, ${glass.shimmerColor}, transparent)` }} />
  {/* top-right glow */}
  <div aria-hidden className="pointer-events-none absolute right-[-4rem] top-[-12rem] h-[28rem] w-[58rem] rounded-full"
    style={glass.topRightGlow} />
  {children}
</div>
```

---

## 7. `<GlassPanel>` component

The primary consumer API. Wraps `getGlassStyles()` and adds interactive effects automatically.

```tsx
import GlassPanel from '../components/GlassPanel';

<GlassPanel
  intensity="medium"      // 'subtle' | 'medium' | 'strong'
  topGlow                 // boolean — upper-right ambient glow (default: true)
  bottomGlow={false}      // boolean — lower-left counter-glow (default: false)
  rounded="rounded-[2rem]"// Tailwind class — any border-radius
  className="p-7"         // forwarded to the root element
  style={{...}}           // merged with glass.panel styles
  as="section"            // render as any element (default: 'div')
>
  Your content here
</GlassPanel>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'subtle' \| 'medium' \| 'strong'` | `'medium'` | Visual weight / opacity tier |
| `topGlow` | `boolean` | `true` | Upper-right blue ambient glow |
| `bottomGlow` | `boolean` | `false` | Lower-left teal counter-glow |
| `rounded` | `string` | `'rounded-[2.2rem]'` | Any Tailwind border-radius class |
| `className` | `string` | `''` | Added to the root element |
| `style` | `React.CSSProperties` | — | Merged after `glass.panel` (can override) |
| `as` | `React.ElementType` | `'div'` | Root element tag |

### Built-in interactive effects

`GlassPanel` tracks mouse position internally and applies two effects on hover:

1. **Specular light wash** — a `screen`-blend radial gradient follows the cursor, simulating light reflecting off the glass surface. Controlled by `GLASS_LIGHT_ALPHA`.
2. **Shadow on the far side** — a dark radial at the position *opposite* the cursor adds dimensionality. Controlled by `GLASS_SHADOW_ALPHA`.

Both fade in/out with a 500ms CSS transition. No extra props needed.

---

## 8. Anatomy of a glass surface

A fully-featured glass panel is built from seven layers in z-order:

```
┌─────────────────────────────────────────┐
│  7. Content (children)           z: 10  │
│  6. Top-right ambient glow        z: 1  │
│  5. Bottom-left counter-glow      z: 1  │
│  4. Screen-blend light wash             │  ← hover only, screen blend
│  3. Shadow radial                       │  ← hover only
│  2. Top-edge shimmer line (1px)         │
│  1. Panel background (backdrop-filter)  │
└─────────────────────────────────────────┘
```

All decorative layers are `pointer-events-none aria-hidden` — they never interfere with interaction or accessibility.

**Why `overflow: hidden` is required on the container:** the corner glow divs are intentionally oversized (e.g. `h-[28rem] w-[58rem]`) so their blurred radial washes across the entire panel top. Without `overflow: hidden`, they would spill into adjacent layout.

---

## 9. Tinted glass

To apply a colour wash without losing the glass texture, layer a `screen`-blended div over a `GlassPanel`:

```tsx
<GlassPanel intensity="medium" topGlow rounded="rounded-[2rem]" className="p-7">
  {/* Colour wash — screen blend preserves the texture */}
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 rounded-[inherit]"
    style={{
      background: 'oklch(0.55 0.28 240)',  // hue 240 = sapphire
      mixBlendMode: 'screen',
      opacity: 0.18,
    }}
  />
  <p className="relative z-10">Content</p>
</GlassPanel>
```

**Why `screen` blend and not `background` colour?** Setting the panel's background directly to a hue would saturate the frosted region and flatten the texture. `screen` merges the colour into the existing gradient without destroying the luminosity variation.

### Semantic colour palette for tints

| Colour | oklch | Use |
|--------|-------|-----|
| Sapphire | `oklch(0.55 0.28 240)` | Default / neutral |
| Teal | `oklch(0.60 0.22 200)` | Calm, data |
| Violet | `oklch(0.58 0.26 290)` | Elevated, featured |
| Rose | `oklch(0.62 0.22 10)` | Warning, attention |
| Amber | `oklch(0.72 0.20 72)` | Caution, highlight |
| Emerald | `oklch(0.65 0.22 160)` | Success, live, healthy |

Keep opacity at `0.14–0.22`. Above that the surface starts to look painted rather than tinted.

---

## 10. Backdrop & background requirements

Glass only works when there is something interesting behind it. The app background is a multi-layer composite:

```css
body {
  background:
    /* Film-grain noise (SVG feTurbulence, 180px tile) */
    url("data:image/svg+xml,..."),
    /* Upper-left colour radial */
    radial-gradient(circle at 14% 18%, oklch(0.42 0.24 216 / 0.26), transparent 26%),
    /* Upper-right colour radial */
    radial-gradient(circle at 88% 10%, oklch(0.50 0.28 206 / 0.28), transparent 24%),
    /* Deep bottom anchor */
    radial-gradient(ellipse 100% 55% at 50% 100%, oklch(0.11 0.08 248 / 0.94), transparent 100%),
    /* Base gradient */
    linear-gradient(180deg, oklch(0.12 0.030 246) 0%, oklch(0.07 0.05 250) 100%);
  background-attachment: fixed; /* critical — keeps the light field stationary while content scrolls */
}
```

`background-attachment: fixed` is **essential**. Without it, the radials move with the page scroll, so the glass panels appear to slide through a static texture rather than floating above a fixed light field.

A thin `::before` pseudo-element adds a second grain pass at `mix-blend-mode: soft-light` for additional film texture without repainting.

---

## 11. Typography utilities

Three Tailwind `@utility` classes add physical depth to text on dark surfaces.

```css
@utility text-bevel {
  text-shadow: 0 1px 1px oklch(0 0 0 / 0.48), 0 -1px 0 oklch(1 0 0 / 0.07);
}

@utility text-bevel-strong {
  text-shadow:
    0 1px 2px oklch(0 0 0 / 0.62),
    0 -1px 0 oklch(1 0 0 / 0.20),
    0 2px 16px oklch(0 0 0 / 0.36);
}

@utility text-bevel-ink {
  /* for dark text on light surfaces */
  text-shadow: 0 1px 0 oklch(1 0 0 / 0.32), 0 -1px 0 oklch(0 0 0 / 0.1);
}
```

### Usage convention

| Class | When to use |
|-------|-------------|
| `text-bevel` | Body text, labels, metadata on glass panels |
| `text-bevel-strong` | Headings, large display type, numbers |
| `text-bevel-ink` | Text on light backgrounds (rare in this dark-first UI) |

The mechanism: a 1px downward shadow in near-black simulates depth, and a counter-shadow upward in near-white simulates the light catching the top edge of the letterform — the same bevel principle used in embossed printing.

---

## 12. Interactive effects

### Mouse-tracking specular (in `GlassPanel`)

```
cursor position → % of panel width/height
    → radial-gradient centre follows cursor
    → screen-blend light wash shifts colour temperature toward the cursor
    → opposite-side radial darkens (shadow follows)
```

Both effects use `opacity: 0` at rest and transition to `opacity: 1` on hover with `transition-duration: 500ms`. This prevents a jarring jump when the cursor first enters the panel.

### Snippet card radial border

Snippet cards don't use `GlassPanel` — they implement the mouse-tracking pattern manually to control the border gradient:

```tsx
style={{
  border: '1px solid transparent',
  backgroundImage: `
    linear-gradient(oklch(0.22 0.028 254 / ${CARD_BG_ALPHA}), ...),
    radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
      oklch(0.66 0.14 232 / ${isHovered ? '0.08' : '0.06'}),
      ...)
  `,
  backgroundOrigin: 'padding-box, border-box',
  backgroundClip:  'padding-box, border-box',
}}
```

The first gradient fills the padding box (visible background). The second gradient fills the border box — making the border itself a radial gradient that brightens where the cursor is nearest.

---

## 13. Nesting & depth hierarchy

Glass panels can be nested. Each layer adds a degree of frosted opacity above the previous.

```
Background (dark gradient + noise grain)
└── GlassPanel intensity="subtle"     (base card / context frame)
    └── GlassPanel intensity="medium" (inner section or header)
        └── GlassPanel intensity="strong" (focused element, e.g. a dialog)
```

Rules for nesting:

- Step up one intensity level per nesting depth.
- Add `topGlow` on inner panels sparingly — glows accumulate and can oversaturate.
- The container panel typically uses `p-0 overflow-hidden` when nesting panels that span full width (e.g. a panel with a glass header bar).

### Modal elevation

Dialogs and modals always use `'strong'` intensity and a custom `boxShadow` override:

```tsx
<GlassPanel
  intensity="strong"
  topGlow
  rounded="rounded-[1.4rem]"
  className="p-5"
  style={{ boxShadow: '0 16px 56px oklch(0.05 0.015 250 / 0.64), inset 0 1px 0 oklch(0.8 0.1 230 / 0.22)' }}
>
```

The `0 16px 56px` outer shadow lifts the modal off the dimmed background. The `inset 0 1px 0` keeps the top-edge shimmer prominent despite the stronger opacity.

---

## 14. Snippet card: manual glass pattern

The `Snippet` component doesn't use `GlassPanel` because it needs custom border gradient behaviour (see §12). The pattern it follows manually:

1. Outer `div` with `overflow-hidden rounded-[2.2rem]` and mouse-tracking state.
2. `backgroundImage` with two gradients: flat colour on `padding-box`, radial on `border-box`.
3. `boxShadow` transitions between resting and hover states.
4. Decorative children: `glassEdge` (1px shimmer line), two corner `glow` divs.
5. `CARD_BG_ALPHA` imported from `glass.ts` to stay in sync with `GLASS_OPACITY`.

If `GLASS_OPACITY` changes in `glass.ts`, `CARD_BG_ALPHA` recomputes and all snippet cards update automatically.

---

## 15. Do's and don'ts

### Do

- Always wrap decorative layer divs in `aria-hidden="true"` and `pointer-events-none`.
- Use `relative overflow-hidden` on the container — glows are absolutely positioned and oversized by design.
- Set `background-attachment: fixed` on any wrapper that hosts glass panels. Without it, the illusion breaks on scroll.
- Use `text-bevel` or `text-bevel-strong` on all text inside glass panels — the microcontrast dramatically improves legibility against frosted backgrounds.
- Step intensity upward when nesting: `subtle → medium → strong`.

### Don't

- Don't apply `glass.panel.background` without also `glass.panel.backdropFilter` — the `backdropFilter` is what makes the panel appear frosted.
- Don't put a glass panel on a solid-colour or white background — `backdrop-filter: blur(...)` blurs what's *behind* the element; on a solid background there's nothing to blur.
- Don't tint with opacity above `~0.22` using the screen-blend wash approach — above that threshold the panel looks painted, not tinted.
- Don't skip `overflow: hidden` on nested glass — the corner glow divs are 28rem × 58rem and will spill into siblings.
- Don't set `background-attachment: scroll` instead of `fixed` — the light field must be stationary for the glass effect to work as panels scroll past it.
- Don't add more than two ambient glow divs per panel. Three or more creates visible colour banding.

---

## 16. Global retheme recipe

To shift the entire UI's glass personality, edit only these values in `src/design/glass.ts`:

```ts
// More transparent / more glass-like:
export const GLASS_OPACITY = 0.50; // was 0.66

// More frosted:
export const GLASS_BLUR = 60; // was 40

// Stronger cursor tracking effect:
export const GLASS_LIGHT_ALPHA  = 0.28; // was 0.22
export const GLASS_SHADOW_ALPHA = 0.26; // was 0.20
```

Then update `--color-glass-card`, `--color-glass-row`, `--color-glass-field` in `src/index.css` to match. `CARD_BG_ALPHA` in `glass.ts` recomputes automatically from `GLASS_OPACITY`.

For a **light-mode** glass: reverse the background — use `oklch(0.96 0.01 240)` as the base — and swap to `text-bevel-ink` on all panel text. The `getGlassStyles()` colour constants (`BG_L`, `EDGE`, `LIGHT`) would need to be adjusted to work against a light backdrop.

---

*Live reference: navigate to `/glass` in the app to see all intensity tiers, tint swatches, blur levels, glow combinations, radius options, nested patterns, and common UI components rendered in glass on five background presets.*
