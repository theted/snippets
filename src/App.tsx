import React, { useState, FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import CreateSnippet from './pages/CreateSnippet';
import Snippets from './pages/Snippets';
import Preferences from './pages/Preferences';
import SnippetPage from './pages/SnippetPage';
import GoogleAuth from './components/GoogleAuth';
import Spinner from './components/Spinner';
import { AuthProvider } from './contexts/authContext';
import { ThemeContext, ThemeContextValue } from './contexts/themeContext';
import { DEFAULT_THEME, ENVIRONMENT } from './config';

const queryClient = new QueryClient();

type ThemePreferences = Pick<ThemeContextValue, 'showLineNumbers' | 'theme'>;

const getDefaultGlobalState = (): ThemePreferences => ({
  theme: window.localStorage.getItem('theme') || DEFAULT_THEME,
  showLineNumbers: window.localStorage.getItem('showLineNumbers') === 'true',
});

const App: FC = () => {
  const [globalState, setGlobalState] = useState<ThemePreferences>(getDefaultGlobalState);

  const value: ThemeContextValue = {
    background: 'oklch(0.18 0.03 258)',
    showLineNumbers: globalState.showLineNumbers,
    setLineNumbers: (nextValue: boolean) => {
      setGlobalState((previous) => ({ ...previous, showLineNumbers: nextValue }));
      window.localStorage.setItem('showLineNumbers', String(nextValue));
    },
    theme: globalState.theme,
    setTheme: (newTheme: string) => {
      setGlobalState((previous) => ({ ...previous, theme: newTheme }));
      window.localStorage.setItem('theme', newTheme);
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeContext.Provider value={value}>
          <Spinner />
          <div className="App">
            <Routes>
              <Route
                path="/"
                element={(
                  <div className="app-shell">
                    <header className="app-hero">
                      <p className="app-kicker">Deep-Focus Code Archive</p>
                      <h1 className="app-title">
                        <span>Snippets</span>
                      </h1>
                      <p className="app-subtitle">
                        A spacious, low-light workspace for the fragments you return to most.
                        The interface stays quiet so the code itself can take the room.
                      </p>
                      <div className="app-toolbar">
                        <CreateSnippet />
                        <Preferences />
                      </div>
                      <div className="mt-8 flex justify-end">
                        <GoogleAuth />
                      </div>
                    </header>
                    <Snippets />
                  </div>
                )}
              />
              <Route path="/snippets/:id" element={<SnippetPage />} />
            </Routes>
          </div>
        </ThemeContext.Provider>
      </AuthProvider>
      {ENVIRONMENT === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default App;
