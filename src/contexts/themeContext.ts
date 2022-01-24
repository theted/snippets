import React from 'react';
import { DEFAULT_THEME } from '../config';

const defaults = {
  showLineNumbers: true,
  setLineNumbers: (e) => { console.log(e); },
  theme: DEFAULT_THEME,
  setTheme: (theme) => theme,
};

export const ThemeContext = React.createContext(defaults);

export default defaults;
