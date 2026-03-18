import React from 'react';

/*
 * BackgroundAnimation — feature-flagged ambient layer.
 *
 * Performance design:
 *  - Pure CSS @keyframes on transform/opacity only → compositor thread, zero JS
 *  - No filter:blur on animated elements → no per-frame rasterisation cost
 *  - No mix-blend-mode on animated elements → no per-frame layer re-compositing
 *  - Gradient softness comes from wide transparent stops in radial-gradient
 *  - Static grain via CSS ::after pseudo-element (SVG data URI, no CPU feTurbulence)
 *  - will-change:transform only on elements that actually translate
 */

// eslint-disable-next-line no-console
console.log('[BackgroundAnimation] EXPERIMENTAL_BACKGROUND is active ✓');

const BackgroundAnimation: React.FC = () => (
  <div aria-hidden="true" className="bg-anim-root">

    {/* ── Deep base layer: very slow shifting wash ─── */}
    <div className="bg-anim-wash" />

    {/* ── Orb cluster A — top-right, blue-cyan ──────── */}
    <div className="bg-anim-orb bg-anim-orb-a" />
    <div className="bg-anim-orb bg-anim-orb-b" />

    {/* ── Orb cluster B — bottom-left, indigo-violet ── */}
    <div className="bg-anim-orb bg-anim-orb-c" />
    <div className="bg-anim-orb bg-anim-orb-d" />

    {/* ── Mid-field accent — teal, slow diagonal drift  */}
    <div className="bg-anim-orb bg-anim-orb-e" />

    {/* ── Aurora strip — horizontal shimmer band ─────  */}
    <div className="bg-anim-aurora" />

    {/* Grain is a CSS ::after pseudo-element on .bg-anim-root */}

  </div>
);

export default BackgroundAnimation;
