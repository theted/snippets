import React from 'react';
import { DEFAULT_THEME } from '../config';

export type ThemeContextValue = {
  background: string;
  showLineNumbers: boolean;
  setLineNumbers: (nextValue: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
};

const defaults: ThemeContextValue = {
  background: 'oklch(0.18 0.03 258)',
  showLineNumbers: true,
  setLineNumbers: () => {},
  theme: DEFAULT_THEME,
  setTheme: () => {},
};

export const ThemeContext = React.createContext<ThemeContextValue>(defaults);

export default defaults;
