import React from 'react';
import {
  BG_PRESETS,
  PATTERNS,
  useBackground,
} from '../context/BackgroundContext';

const glassPanel = {
  background: 'oklch(0.14 0.024 254 / 0.72)',
  backdropFilter: 'blur(20px)',
  border: '1px solid oklch(0.4 0.044 248 / 0.32)',
  boxShadow: '0 4px 24px oklch(0.05 0.015 250 / 0.40)',
} as const;

const glassExpanded = {
  background: 'oklch(0.14 0.024 254 / 0.82)',
  backdropFilter: 'blur(24px)',
  border: '1px solid oklch(0.4 0.044 248 / 0.32)',
  boxShadow: '0 8px 32px oklch(0.05 0.015 250 / 0.40)',
} as const;

const BackgroundSwitcher: React.FC = () => {
  const {
    bgId, customHue, backdropIntensity, patternId,
    showCustom, copied,
    setBgId, setCustomHue, setBackdropIntensity, setPatternId, setShowCustom,
    handleCopy,
  } = useBackground();

  return (
    <div
      className="flex flex-col items-end gap-2"
    >
      {/* ── Row 1: gradient presets ── */}
      <div className="inline-flex items-center gap-1 rounded-full p-1.5" style={glassPanel}>
        {BG_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => { setBgId(preset.id); setCustomHue(null); }}
            title={preset.label}
            className="relative flex items-center gap-2 rounded-full px-3 py-1.5 transition duration-200"
            style={{
              background: customHue === null && bgId === preset.id
                ? 'oklch(0.28 0.04 252 / 0.80)'
                : 'transparent',
            }}
          >
            <span
              className="block h-3 w-3 shrink-0 rounded-full ring-1 ring-white/10"
              style={{ background: preset.swatch }}
            />
            <span
              className="text-[0.60rem] font-semibold uppercase tracking-[0.22em]"
              style={{
                color: customHue === null && bgId === preset.id
                  ? 'oklch(0.95 0.006 255)'
                  : 'oklch(0.62 0.03 255)',
              }}
            >
              {preset.label}
            </span>
          </button>
        ))}

        {/* Custom hue toggle */}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          title="Custom hue"
          className="relative flex items-center gap-2 rounded-full px-3 py-1.5 transition duration-200"
          style={{ background: showCustom ? 'oklch(0.28 0.04 252 / 0.80)' : 'transparent' }}
        >
          <span
            className="block h-3 w-3 shrink-0 rounded-full ring-1 ring-white/10"
            style={{
              background: customHue !== null
                ? `oklch(0.55 0.22 ${customHue})`
                : 'conic-gradient(oklch(0.6 0.22 0), oklch(0.6 0.22 60), oklch(0.6 0.22 120), oklch(0.6 0.22 180), oklch(0.6 0.22 240), oklch(0.6 0.22 300), oklch(0.6 0.22 360))',
            }}
          />
          <span
            className="text-[0.60rem] font-semibold uppercase tracking-[0.22em]"
            style={{ color: showCustom ? 'oklch(0.95 0.006 255)' : 'oklch(0.62 0.03 255)' }}
          >
            Custom
          </span>
        </button>
      </div>

      {/* ── Row 2: pattern picker ── */}
      <div className="inline-flex items-center gap-1 rounded-full p-1.5" style={glassPanel}>
        <span className="px-2 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[oklch(0.45_0.02_255)]">
          Pattern
        </span>
        {PATTERNS.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            onClick={() => setPatternId(pattern.id)}
            title={pattern.label}
            className="flex flex-col items-center gap-1 rounded-full px-2.5 py-1.5 transition duration-200"
            style={{
              background: patternId === pattern.id
                ? 'oklch(0.28 0.04 252 / 0.80)'
                : 'transparent',
            }}
          >
            {pattern.id === 'none' ? (
              /* "None" swatch — empty circle */
              <span
                className="block h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20"
                style={{ background: 'oklch(0.18 0.02 254 / 0.6)' }}
              />
            ) : (
              /* Pattern swatch — preview tile */
              <span
                className="block h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20"
                style={{
                  backgroundImage: `url("${pattern.swatch}")`,
                  backgroundSize: 'cover',
                  backgroundColor: 'oklch(0.22 0.04 248)',
                }}
              />
            )}
            <span
              className="text-[0.52rem] font-semibold uppercase tracking-[0.18em]"
              style={{
                color: patternId === pattern.id
                  ? 'oklch(0.90 0.006 255)'
                  : 'oklch(0.50 0.02 255)',
              }}
            >
              {pattern.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Extended custom panel ── */}
      {showCustom && (
        <div
          className="flex flex-col gap-4 rounded-[1.4rem] p-4"
          style={{ ...glassExpanded, minWidth: '22rem' }}
        >
          {/* Hue slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[oklch(0.62_0.03_255)]">
                Hue
              </span>
              {customHue !== null && (
                <span className="text-[0.58rem] font-semibold text-[oklch(0.62_0.03_255)]">
                  {customHue}°
                </span>
              )}
            </div>
            <div
              className="relative h-3 overflow-hidden rounded-full"
              style={{ background: 'conic-gradient(oklch(0.45 0.20 0), oklch(0.45 0.20 60), oklch(0.45 0.20 120), oklch(0.45 0.20 180), oklch(0.45 0.20 240), oklch(0.45 0.20 300), oklch(0.45 0.20 360)) border-box' }}
            >
              <div
                className="absolute inset-y-0 w-1.5 rounded-full bg-white/80 ring-1 ring-white/40 transition-all duration-75"
                style={{ left: `calc(${((customHue ?? 240) / 360) * 100}% - 3px)` }}
              />
            </div>
            <input
              type="range" min={0} max={359} step={1}
              value={customHue ?? 240}
              onChange={(e) => setCustomHue(Number(e.target.value))}
              className="mt-[-0.6rem] w-full cursor-pointer opacity-0"
              style={{ height: '0.75rem' }}
            />
          </div>

          {/* Backdrop intensity slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[oklch(0.62_0.03_255)]">
                Backdrop intensity
              </span>
              <span className="text-[0.58rem] font-semibold text-[oklch(0.62_0.03_255)]">
                {Math.round(backdropIntensity * 100)}%
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full" style={{ background: 'oklch(0.28 0.02 254 / 0.6)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
                style={{ width: `${backdropIntensity * 100}%`, background: 'oklch(0.71 0.17 244)' }}
              />
            </div>
            <input
              type="range" min={0.1} max={1.5} step={0.05}
              value={backdropIntensity}
              onChange={(e) => {
                setBackdropIntensity(Number(e.target.value));
                if (customHue === null) setCustomHue(240);
              }}
              className="mt-[-0.6rem] w-full cursor-pointer opacity-0"
              style={{ height: '0.75rem' }}
            />
          </div>

          {/* Copy gradient */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-full border border-[oklch(0.4_0.044_248_/_0.32)] bg-[oklch(0.22_0.03_254_/_0.6)] py-2 text-[0.60rem] font-semibold uppercase tracking-[0.22em] text-[oklch(0.82_0.025_255)] transition duration-200 hover:bg-[oklch(0.28_0.04_252_/_0.80)] hover:text-white"
          >
            {copied ? '✓ Copied!' : 'Copy CSS gradient'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundSwitcher;
