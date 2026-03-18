import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/themeContext';
import { THEMES } from '../config';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import Button from '../components/Button';

const options = THEMES.map((lang) => ({ label: lang, value: lang }));

const Preferences: React.FC = () => {
  const { showLineNumbers, setLineNumbers, setTheme, theme } = useContext(ThemeContext);
  const [showPreferences, setShowPreferences] = useState(false);

  const closePreferences = () => setShowPreferences(false);

  if (!showPreferences) {
    return (
      <Button type="button" variant="info" onClick={() => setShowPreferences(true)}>
        <i className="icon-cog" />
        <span>Preferences</span>
      </Button>
    );
  }

  return (
    <Modal closeModal={closePreferences}>
      <div
        className="relative w-full overflow-hidden rounded-[2.4rem] p-8 md:p-12"
        style={{
          border: '1px solid transparent',
          backgroundImage: `
            linear-gradient(oklch(0.17 0.022 254 / 0.97), oklch(0.17 0.022 254 / 0.97)),
            linear-gradient(135deg, oklch(0.56 0.12 242 / 0.38), oklch(0.34 0.06 248 / 0.22) 50%, oklch(0.44 0.08 252 / 0.28))
          `,
          backgroundOrigin: 'padding-box, border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '0 24px 72px oklch(0.05 0.015 250 / 0.5), inset 0 1px 0 oklch(0.8 0.1 230 / 0.16)',
        }}
      >
        {/* Top-edge shimmer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(0.88 0.14 226 / 0.55), transparent)' }}
        />
        {/* Corner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-5rem] top-[-4rem] h-64 w-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, oklch(0.72 0.16 240 / 0.22) 0%, transparent 68%)',
            filter: 'blur(32px)',
          }}
        />

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
            style={{
              background: 'linear-gradient(135deg, oklch(0.24 0.028 254 / 0.52), oklch(0.20 0.022 256 / 0.48))',
              border: '1px solid oklch(0.42 0.05 248 / 0.22)',
              boxShadow: 'inset 0 1px 0 oklch(0.78 0.1 232 / 0.1)',
            }}
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

          {/* Theme row */}
          <div
            className="overflow-hidden rounded-[1.8rem] p-6"
            style={{
              background: 'linear-gradient(135deg, oklch(0.24 0.028 254 / 0.52), oklch(0.20 0.022 256 / 0.48))',
              border: '1px solid oklch(0.42 0.05 248 / 0.22)',
              boxShadow: 'inset 0 1px 0 oklch(0.78 0.1 232 / 0.1)',
            }}
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
      </div>
    </Modal>
  );
};

export default Preferences;
