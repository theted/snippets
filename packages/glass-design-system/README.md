# glass-design-system

A frosted-glass UI component library for dark, depth-rich interfaces. Every surface — panels, inputs, buttons, dividers — shares a single coherent material governed by two master knobs: **blur** and **opacity**.

---

## Installation

The package is consumed as a local npm workspace:

```json
// In the root package.json
"workspaces": ["packages/*"]
```

Import in the app:

```ts
import { GlassProvider, GlassPanel, GlassInput } from 'glass-design-system';
import 'glass-design-system/styles'; // CSS tokens and utilities
```

The Vite config resolves the import via alias (no pre-build step required):

```ts
// vite.config.ts
resolve: {
  alias: {
    'glass-design-system': resolve(__dirname, 'packages/glass-design-system/src/index.ts'),
  },
},
```

---

## Quick start

```tsx
import { GlassProvider, GlassPanel, GlassPill } from 'glass-design-system';
import 'glass-design-system/styles';

export default function App() {
  return (
    <GlassProvider blur={40} opacity={0.66}>
      <GlassPanel intensity="medium" className="p-8">
        <div className="relative z-10">
          <h2>Hello glass</h2>
          <GlassPill size="lg">Get started</GlassPill>
        </div>
      </GlassPanel>
    </GlassProvider>
  );
}
```

> **Content elevation:** wrap your content in `<div className="relative z-10">` inside any `GlassPanel`. The decorative overlay divs (shimmer, glows) are absolutely positioned — without elevation your content can paint beneath them.

---

## GlassProvider

Configures all glass components beneath it. Nest providers to override a subtree.

```tsx
<GlassProvider blur={40} opacity={0.66} lightAlpha={0.22} shadowAlpha={0.20}>
  <App />
</GlassProvider>

{/* Only this subtree gets a tighter blur */}
<GlassProvider blur={20}>
  <CompactSidebar />
</GlassProvider>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blur` | `number` | `40` | `backdrop-filter: blur(Npx)` applied to all panels |
| `opacity` | `number` | `0.66` | Global alpha multiplier for all glass surfaces (0–1) |
| `lightAlpha` | `number` | `0.22` | Specular wash intensity on hover (0–1) |
| `shadowAlpha` | `number` | `0.20` | Shadow intensity on the far side from the cursor (0–1) |

All props are optional; unspecified values inherit from the nearest parent provider.

### `useGlass()`

Read the current provider config from any component:

```ts
import { useGlass } from 'glass-design-system';

const { blur, opacity } = useGlass();
```

---

## GlassPanel

The primary surface component. Applies the glass material, top-edge shimmer, ambient corner glows, and mouse-tracking specular/shadow effects automatically.

```tsx
<GlassPanel
  intensity="medium"
  topGlow
  rounded="rounded-[2rem]"
  className="p-7"
>
  <div className="relative z-10">
    {/* your content */}
  </div>
</GlassPanel>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `'subtle' \| 'medium' \| 'strong'` | `'medium'` | Opacity / visual weight tier |
| `topGlow` | `boolean` | `true` | Upper-right ambient blue glow |
| `bottomGlow` | `boolean` | `false` | Lower-left teal counter-glow |
| `rounded` | `string` | `'rounded-[2.2rem]'` | Any Tailwind border-radius class |
| `className` | `string` | `''` | Appended to root element |
| `style` | `CSSProperties` | — | Merged after the glass styles (can override) |
| `as` | `React.ElementType` | `'div'` | Render as any HTML element (`'form'`, `'section'`, etc.) |

### Intensity tiers

All alphas scale against the nearest `GlassProvider`'s `opacity` value.

| Intensity | Use case |
|-----------|----------|
| `'subtle'` | Background context panels, nested inner containers |
| `'medium'` | Standard cards, navigation bars, sidebars |
| `'strong'` | Modals, dialogs, elevated popovers |

### Nesting rule

Outer panels should have equal or higher intensity than inner panels:

```
subtle  → nested medium  → nested strong   ✓
strong  → nested subtle                    ✓
subtle  → nested strong                    ✗  (inverted depth)
```

---

## GlassInput

A glass-styled `<input>` element. Accepts all standard `<input>` props plus shared glass options.

```tsx
import { GlassInput } from 'glass-design-system';

<GlassInput
  type="text"
  placeholder="Search…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fieldBlur` | `number` | `16` | `backdrop-filter` blur for the field (independent of provider) |
| `shimmer` | `boolean` | `true` | Top-edge shimmer line |
| `wrapperClassName` | `string` | — | Class added to the outer wrapper div |
| `wrapperStyle` | `CSSProperties` | — | Inline style for the outer wrapper div |

---

## GlassTextarea

A glass-styled `<textarea>`. Same props as `GlassInput` plus all standard `<textarea>` props.

```tsx
import { GlassTextarea } from 'glass-design-system';

<GlassTextarea
  placeholder="Describe your snippet…"
  rows={4}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

---

## GlassInputWrap

Wraps any child element with the glass input treatment. Use when you need glass styling on a native `<select>`, a custom component, or any element `GlassInput` and `GlassTextarea` don't cover.

```tsx
import { GlassInputWrap } from 'glass-design-system';

<GlassInputWrap>
  <select className="block w-full bg-transparent px-5 py-4 focus:outline-none">
    <option>Option A</option>
    <option>Option B</option>
  </select>
</GlassInputWrap>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `focused` | `boolean` | — | Controlled focus state; auto-detected from child focus events when omitted |
| `radius` | `string` | `'1.4rem'` | CSS border-radius value |
| `fieldBlur` | `number` | `16` | Backdrop blur in px |
| `shimmer` | `boolean` | `true` | Top-edge shimmer line |
| `wrapperClassName` | `string` | — | Extra class on the wrapper div |
| `wrapperStyle` | `CSSProperties` | — | Inline style on the wrapper div |

---

## GlassPill

The canonical button / navigation link. Handles glass surface, text-bevel, hover lift, and focus ring automatically.

```tsx
import { GlassPill } from 'glass-design-system';
import { Link } from 'react-router-dom';

{/* Navigation link */}
<GlassPill size="lg" as={Link} to="/favorites">
  Favorites
</GlassPill>

{/* Toggle button */}
<GlassPill
  size="xs"
  variant={isActive ? 'active' : 'default'}
  onClick={toggle}
>
  Grid
</GlassPill>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size tier |
| `variant` | `'default' \| 'active' \| 'accent'` | `'default'` | Colour / state variant |
| `as` | `React.ElementType` | `'button'` | Underlying element (`Link`, `'a'`, `'button'`) |
| `className` | `string` | `''` | Appended to root |

### Size guide

| Size | Text | Typical use |
|------|------|-------------|
| `xs` | 0.60 rem | Layout toggles, tiny controls |
| `sm` | 0.68 rem | Card controls, compact nav |
| `md` | 0.68 rem | Standard nav links |
| `lg` | 0.72 rem | Top-level toolbar actions |

### Variants

| Variant | Appearance | Use |
|---------|-----------|-----|
| `default` | Muted surface, lifts on hover | Resting state |
| `active` | `surface-strong`, no hover shift | Already-selected state |
| `accent` | Sapphire-tinted glass | Active filters, highlights |

---

## GlassDivider

A 1px horizontal rule that fades to transparent at both ends — consistent with the glass language of atmosphere over hard lines.

```tsx
import { GlassDivider } from 'glass-design-system';

<GlassDivider className="my-10" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Tailwind spacing / sizing classes |

---

## Low-level API

For custom surfaces that need the glass material without `GlassPanel`:

```tsx
import { getGlassStyles, useGlass } from 'glass-design-system';

function CustomSurface() {
  const config = useGlass();
  const glass = getGlassStyles('medium', config);

  return (
    <div
      className="relative overflow-hidden rounded-[2rem]"
      style={glass.panel}
    >
      {/* Top-edge shimmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${glass.shimmerColor}, transparent)` }}
      />
      <div className="relative z-10">{/* content */}</div>
    </div>
  );
}
```

`getGlassStyles(intensity, config)` returns:

```ts
{
  panel: {
    background:     string;  // oklch background with computed alpha
    backdropFilter: string;  // blur(Npx)
    border:         string;  // 1px solid semi-transparent edge
    boxShadow:      string;  // outer depth shadow + inset shimmer
  };
  shimmerColor:  string;     // colour for the 1px top-edge gradient
  topRightGlow:  { background: string; filter: string };
  bottomLeftGlow:{ background: string; filter: string };
}
```

---

## CSS tokens

Import the stylesheet once at the app root:

```ts
import 'glass-design-system/styles';
```

This provides CSS custom properties (`--color-text`, `--color-accent`, `--color-border`, etc.), font stack variables, and the `text-bevel` / `text-bevel-strong` Tailwind utilities used throughout the system.

---

## Background requirements

Glass panels need an interesting backdrop to blur. The effect breaks on flat or white backgrounds because `backdrop-filter: blur()` blurs whatever is *behind* the element. Use a fixed, multi-layer gradient and ensure it doesn't scroll with the page:

```css
body {
  background: /* colour radials + grain + base gradient */;
  background-attachment: fixed; /* critical — keeps the light field stationary */
}
```

See `src/glass.css` for the full reference background.

---

## Showcase

Run the interactive showcase to explore all intensity tiers, glows, blur levels, tint swatches, nested patterns, and form components live on five background presets:

```sh
npm run showcase --workspace=packages/glass-design-system
```
