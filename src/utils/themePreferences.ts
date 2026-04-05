import { DEFAULT_THEME, THEMES } from '../config';
import type { ThemeContextValue } from '../contexts/themeContext';

export type ThemePreferences = Pick<
  ThemeContextValue,
  'showLineNumbers' | 'theme' | 'autoSize' | 'showBackground'
>;

type ThemePreferenceKey = keyof ThemePreferences;

const STORAGE_KEYS: Record<ThemePreferenceKey, string> = {
  showLineNumbers: 'showLineNumbers',
  theme: 'theme',
  autoSize: 'autoSize',
  showBackground: 'showBackground',
};

const readBooleanPreference = (key: string) => window.localStorage.getItem(key) === 'true';

export const getDefaultThemePreferences = (): ThemePreferences => ({
  theme: window.localStorage.getItem(STORAGE_KEYS.theme) ?? DEFAULT_THEME,
  showLineNumbers: readBooleanPreference(STORAGE_KEYS.showLineNumbers),
  autoSize: readBooleanPreference(STORAGE_KEYS.autoSize),
  showBackground: readBooleanPreference(STORAGE_KEYS.showBackground),
});

export const persistThemePreference = <K extends ThemePreferenceKey>(
  key: K,
  value: ThemePreferences[K],
) => {
  window.localStorage.setItem(STORAGE_KEYS[key], String(value));
};

export const consumeHomeRestoreFlag = () => {
  const flag = window.sessionStorage.getItem('homeRestore');

  if (flag) {
    window.sessionStorage.removeItem('homeRestore');
  }

  return Boolean(flag);
};

export const cycleTheme = (currentTheme: string, direction: 'next' | 'prev') => {
  const currentIndex = THEMES.indexOf(currentTheme);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const step = direction === 'next' ? 1 : -1;

  return THEMES[(safeIndex + step + THEMES.length) % THEMES.length];
};
