import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/themeContext';
import { THEMES } from '../config';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { GlassPanel, GlassDivider, GlassInputWrap } from 'glass-design-system';
import Icon from '../components/Icon';

const Preferences: React.FC = () => {
  const { showLineNumbers, setLineNumbers, setTheme, theme, autoSize, setAutoSize, showBackground, setShowBackground } = useContext(ThemeContext);
  const [showPreferences, setShowPreferences] = useState(false);

  const closePreferences = () => setShowPreferences(false);

  if (!showPreferences) {
    return (
      <Button type="button" variant="info" onClick={() => setShowPreferences(true)}>
        <Icon name="cog" />
        <span>Preferences</span>
      </Button>
    );
  }

  return (
    <Modal closeModal={closePreferences}>
      <GlassPanel
        intensity="strong"
        topGlow
        rounded="rounded-[2.4rem]"
        className="w-full p-8 md:p-12"
      >
        {/* Header */}
        <div className="relative z-10 mb-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.36em] text-[var(--color-text-subtle)]">
            Settings
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.055em] text-[var(--color-text)] md:text-5xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.12),0_2px_16px_oklch(0_0_0_/_0.28)]">
            Preferences
          </h2>
        </div>

        <div className="relative z-10 space-y-4">

          {/* Line numbers row */}
          <GlassPanel
            intensity="subtle"
            topGlow={false}
            rounded="rounded-[1.8rem]"
            className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="relative z-10 max-w-lg">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
                Code Display
              </p>
              <h5 className="mt-2 font-[var(--font-display)] text-xl font-[300] tracking-[-0.04em] text-[var(--color-text)]">
                Show line numbers
              </h5>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                Add a quiet line-number gutter for more structure when scanning large snippets.
              </p>
            </div>
            <label
              className="relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition duration-300 hover:text-[var(--color-text)]"
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              <input
                name="showLineNumbers"
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {showLineNumbers ? 'Enabled' : 'Disabled'}
            </label>
          </GlassPanel>

          {/* Auto-size row */}
          <GlassPanel
            intensity="subtle"
            topGlow={false}
            rounded="rounded-[1.8rem]"
            className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="relative z-10 max-w-lg">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
                Code Display
              </p>
              <h5 className="mt-2 font-[var(--font-display)] text-xl font-[300] tracking-[-0.04em] text-[var(--color-text)]">
                Auto-size code blocks
              </h5>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                Expand code blocks to show all content without scrolling. When off, tall snippets are capped and scroll inline.
              </p>
            </div>
            <label
              className="relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition duration-300 hover:text-[var(--color-text)]"
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              <input
                name="autoSize"
                type="checkbox"
                checked={autoSize}
                onChange={(e) => setAutoSize(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {autoSize ? 'Enabled' : 'Disabled'}
            </label>
          </GlassPanel>

          {/* Background row */}
          <GlassPanel
            intensity="subtle"
            topGlow={false}
            rounded="rounded-[1.8rem]"
            className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="relative z-10 max-w-lg">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
                Appearance
              </p>
              <h5 className="mt-2 font-[var(--font-display)] text-xl font-[300] tracking-[-0.04em] text-[var(--color-text)]">
                Background gradients
              </h5>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                Show the ambient colour orbs and animated gradient behind the interface. Disable for a flat, minimal look.
              </p>
            </div>
            <label
              className="relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition duration-300 hover:text-[var(--color-text)]"
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              <input
                name="showBackground"
                type="checkbox"
                checked={showBackground}
                onChange={(e) => setShowBackground(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {showBackground ? 'Enabled' : 'Disabled'}
            </label>
          </GlassPanel>

          {/* Theme row */}
          <GlassPanel
            intensity="subtle"
            topGlow={false}
            rounded="rounded-[1.8rem]"
            className="p-6"
          >
            <div className="relative z-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]">
                Syntax Theme
              </p>
              <h5 className="mt-2 font-[var(--font-display)] text-xl font-[300] tracking-[-0.04em] text-[var(--color-text)]">
                Code highlighting
              </h5>
              <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--color-text-muted)]">
                Pick the theme that best fits your reading style. Use{' '}
                <kbd>Ctrl</kbd> + <kbd>[</kbd> / <kbd>]</kbd> to cycle without opening this panel.
              </p>
              <div className="mt-5">
                <GlassInputWrap>
                  <select
                    name="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="block w-full appearance-none bg-transparent px-5 py-4 text-base leading-normal text-[var(--color-text)] focus:outline-none md:px-6 md:py-5 md:text-lg"
                  >
                    {THEMES.map((t) => (
                      <option key={t} value={t} style={{ background: 'oklch(0.14 0.02 254)' }}>{t}</option>
                    ))}
                  </select>
                </GlassInputWrap>
              </div>
            </div>
          </GlassPanel>

          <GlassDivider className="my-2" />

          {/* Actions */}
          <div className="relative z-10 flex justify-end pt-2">
            <Button type="button" variant="warning" onClick={closePreferences}>
              Close Panel
            </Button>
          </div>
        </div>
      </GlassPanel>
    </Modal>
  );
};

export default Preferences;
