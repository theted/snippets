import React from 'react';
import { DEFAULT_THEME } from '../config';

const defaults = {
  showLineNumbers: true,
  // eslint-disable-next-line no-unused-vars
  setLineNumbers: (e: boolean) => {},
  theme: DEFAULT_THEME,
  setTheme: (theme) => theme,
};

export const ThemeContext = React.createContext(defaults);

export default defaults;
