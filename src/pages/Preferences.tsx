import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/themeContext';
import { THEMES } from '../config';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { GlassPanel, getGlassStyles, useGlass } from 'glass-design-system';
import Icon from '../components/Icon';

const options = THEMES.map((lang) => ({ label: lang, value: lang }));

const Preferences: React.FC = () => {
  const { showLineNumbers, setLineNumbers, setTheme, theme, autoSize, setAutoSize } = useContext(ThemeContext);
  // Inner setting rows use 'subtle' intensity — visually nested inside the 'strong' outer panel
  const glassConfig = useGlass();
  const rowGlass = getGlassStyles('subtle', glassConfig);
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
          <div
            className="flex flex-col gap-5 overflow-hidden rounded-[1.8rem] p-6 md:flex-row md:items-center md:justify-between"
            style={rowGlass.panel}
          >
            <div className="max-w-lg">
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
              className="inline-flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition duration-300 hover:text-[var(--color-text)]"
              style={{
                background: 'oklch(0.18 0.02 254 / 0.6)',
                border: '1px solid oklch(0.42 0.05 248 / 0.28)',
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
          </div>

          {/* Auto-size row */}
          <div
            className="flex flex-col gap-5 overflow-hidden rounded-[1.8rem] p-6 md:flex-row md:items-center md:justify-between"
            style={rowGlass.panel}
          >
            <div className="max-w-lg">
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
              className="inline-flex shrink-0 cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)] transition duration-300 hover:text-[var(--color-text)]"
              style={{
                background: 'oklch(0.18 0.02 254 / 0.6)',
                border: '1px solid oklch(0.42 0.05 248 / 0.28)',
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
          </div>

          {/* Theme row */}
          <div
            className="overflow-hidden rounded-[1.8rem] p-6"
            style={rowGlass.panel}
          >
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
            <Dropdown
              options={options}
              name="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="mt-5"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
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
