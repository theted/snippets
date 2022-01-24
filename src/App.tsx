import React, { useState, FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import './App.css';
import CreateSnippet from './pages/CreateSnippet';
import Snippets from './pages/Snippets';
import Preferences from './pages/Preferences';
import Spinner from './components/Spinner';
import { ThemeContext } from './contexts/themeContext';
import { ENVIRONMENT } from './config';

const queryClient = new QueryClient();

const classes = {
  wrapper: 'App bg-gray-800',
  header: 'App-header',
};

const defaultGlobalState = {
  theme: window.localStorage.getItem('theme') || 'vs2015',
  showLineNumbers: window.localStorage.getItem('showLineNumbers') as unknown as boolean || false,
};

const App: FC = () => {
  const [globalstate, setGlobalstate] = useState(defaultGlobalState);
  const [actuallyshowLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [actualTheme, setTheme] = useState<string>(globalstate.theme);
  const { theme, showLineNumbers } = globalstate;

  // for our provider
  const value = {
    background: '#333',
    showLineNumbers: actuallyshowLineNumbers,
    setLineNumbers: () => {
      setShowLineNumbers(!actuallyshowLineNumbers);
      window.localStorage.setItem('showLineNumbers', String(showLineNumbers));
    },
    theme: actualTheme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      window.localStorage.setItem('theme', newTheme);
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={value}>
        <Spinner />
        <div className={classes.wrapper}>
          <header className={classes.header}>
            <h1 className="text-white text-4xl">Snippets</h1>
          </header>
          <CreateSnippet />
          <Preferences
            theme={theme}
            showLineNumbers={showLineNumbers}
            setGlobalstate={setGlobalstate}
          />
          <Snippets />
        </div>
      </ThemeContext.Provider>
      {ENVIRONMENT === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default App;
