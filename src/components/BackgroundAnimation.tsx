import React from 'react';

/*
 * BackgroundAnimation — feature-flagged ambient layer.
 *
 * Architecture:
 *  - position:fixed, inset-0, z-index:-1  → always behind all content
 *  - pointer-events:none                  → never intercepts interaction
 *  - Pure CSS @keyframes                  → compositor-only, zero JS per frame
 *  - mix-blend-mode:screen on orbs       → additive light blending (like real light)
 *  - SVG feTurbulence grain               → film-grain texture to reduce banding
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

    {/* ── Film grain via SVG filter ──────────────────── */}
    <svg className="bg-anim-grain" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" />
    </svg>

  </div>
);

export default BackgroundAnimation;
