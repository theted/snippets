import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/themeContext';
import { THEMES } from '../config';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import Box from '../components/Box';
import Button from '../components/Button';

const options = THEMES.map((lang) => ({ label: lang, value: lang }));

const Preferences: React.FC = () => {
  const {
    showLineNumbers, setLineNumbers, setTheme, theme,
  } = useContext(ThemeContext);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  const setThemeCallback = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setTheme(value);
  };

  const closePreferences = () => setShowPreferences(false);
  const toggleShow = () => setShowPreferences((currentValue) => !currentValue);

  if (!showPreferences) {
    return (
      <Button type="button" variant="info" onClick={toggleShow}>
        <i className="icon-cog" />
        <span>Preferences</span>
      </Button>
    );
  }

  return (
    <Modal closeModal={closePreferences}>
      <Box title="Reading Preferences">
        <div className="mt-8 space-y-6">
          <div className="flex flex-col gap-5 rounded-[1.7rem] border border-[var(--color-border)] bg-[var(--color-glass-row)] p-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
                Code Display
              </p>
              <h5 className="mt-3 font-[var(--font-display)] text-2xl font-[250] tracking-[-0.05em] text-[var(--color-text)]">
                Show line numbers
              </h5>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                Add a quiet line-number gutter when you want more structure while scanning larger snippets.
              </p>
            </div>
            <label className="inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-glass-field)] px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
              <input
                name="showLineNumbers"
                type="checkbox"
                checked={showLineNumbers}
                onChange={(event) => setLineNumbers(event.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              Enabled
            </label>
          </div>

          <div className="rounded-[1.7rem] border border-[var(--color-border)] bg-[var(--color-glass-row)] p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-subtle)]">
              Syntax Theme
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-muted)]">
              Pick the code theme that best fits your reading style.
              The interface around it stays deliberately restrained.
            </p>
            <Dropdown
              options={options}
              name="theme"
              value={theme}
              onChange={setThemeCallback}
              className="mt-5"
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="warning" onClick={toggleShow}>
              Close Panel
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default Preferences;
