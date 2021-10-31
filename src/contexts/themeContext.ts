import React from 'react';

const defaults = {
  showLineNumbers: true,
  setLineNumbers: () => {},
  theme: 'vs2015',
  setTheme: () => {},
};

export const ThemeContext = React.createContext(defaults);

export default defaults;
