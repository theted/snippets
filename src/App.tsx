import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlassProvider } from 'glass-design-system';
import './App.css';
import type { CreateSnippetHandle } from './pages/CreateSnippet';
import SnippetPage from './pages/SnippetPage';
import Docs from './pages/Docs';
import Favorites from './pages/Favorites';
import LanguagePage from './pages/LanguagePage';
import Stats from './pages/Stats';
import NotFound from './pages/NotFound';
import type { SearchbarHandle } from './components/Searchbar';
import Spinner from './components/Spinner';
import BackgroundAnimation from './components/BackgroundAnimation';
import HomePage from './components/HomePage';
import { AuthProvider } from './contexts/authContext';
import { ThemeContext } from './contexts/themeContext';
import { ENVIRONMENT } from './config';
import { createPersistentQueryClient } from './utils/queryPersist';
import {
  consumeHomeRestoreFlag,
  cycleTheme,
  getDefaultThemePreferences,
  persistThemePreference,
  type ThemePreferences,
} from './utils/themePreferences';

const queryClient = createPersistentQueryClient();
const APP_BACKGROUND = 'oklch(0.18 0.03 258)';

let appHasNavigated = false;

const SnippetPageRoute = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return <SnippetPage key={id} />;
};

const App = () => {
  const [themePreferences, setThemePreferences] =
    useState<ThemePreferences>(getDefaultThemePreferences);
  const [homeRestore] = useState(consumeHomeRestoreFlag);
  const createSnippetRef = useRef<CreateSnippetHandle>(null);
  const searchbarRef = useRef<SearchbarHandle>(null);
  const navigate = useNavigate();
  const navType = useNavigationType();

  useEffect(() => {
    appHasNavigated = true;
  }, []);

  const updatePreference = <K extends keyof ThemePreferences>(
    key: K,
    value: ThemePreferences[K],
  ) => {
    setThemePreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value,
    }));
    persistThemePreference(key, value);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      switch (event.key) {
        case 'i':
          event.preventDefault();
          createSnippetRef.current?.open();
          break;
        case 'l':
          event.preventDefault();
          searchbarRef.current?.focus();
          break;
        case '/':
          event.preventDefault();
          navigate('/docs');
          break;
        case ']':
        case '[':
          event.preventDefault();
          setThemePreferences((currentPreferences) => {
            const nextTheme = cycleTheme(
              currentPreferences.theme,
              event.key === ']' ? 'next' : 'prev',
            );

            persistThemePreference('theme', nextTheme);

            return {
              ...currentPreferences,
              theme: nextTheme,
            };
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const appClassName = `App${
    homeRestore || (navType === 'POP' && appHasNavigated) ? ' app--restore' : ''
  }`;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlassProvider>
          <ThemeContext.Provider
            value={{
              background: APP_BACKGROUND,
              showLineNumbers: themePreferences.showLineNumbers,
              setLineNumbers: (value) => updatePreference('showLineNumbers', value),
              theme: themePreferences.theme,
              setTheme: (value) => updatePreference('theme', value),
              autoSize: themePreferences.autoSize,
              setAutoSize: (value) => updatePreference('autoSize', value),
              showBackground: themePreferences.showBackground,
              setShowBackground: (value) => updatePreference('showBackground', value),
            }}
          >
            {themePreferences.showBackground && <BackgroundAnimation />}
            <Spinner />
            <div className={appClassName}>
              <Routes>
                <Route
                  path="/"
                  element={<HomePage createSnippetRef={createSnippetRef} searchbarRef={searchbarRef} />}
                />
                <Route path="/snippets/:id" element={<SnippetPageRoute />} />
                <Route path="/language/:language" element={<LanguagePage />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </ThemeContext.Provider>
        </GlassProvider>
      </AuthProvider>
      {ENVIRONMENT === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
