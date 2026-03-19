import React, { useState, useRef, useEffect, FC } from 'react';
import { Routes, Route, Link, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import CreateSnippet, { CreateSnippetHandle } from './pages/CreateSnippet';
import Snippets from './pages/Snippets';
import { SearchbarHandle } from './components/Searchbar';
import { GlassPill, GlassProvider } from 'glass-design-system';
import Preferences from './pages/Preferences';
import SnippetPage from './pages/SnippetPage';
import Docs from './pages/Docs';
import Favorites from './pages/Favorites';
import LanguagePage from './pages/LanguagePage';
import NotFound from './pages/NotFound';
import GoogleAuth from './components/GoogleAuth';
import Spinner from './components/Spinner';
import BackgroundAnimation from './components/BackgroundAnimation';
import { AuthProvider } from './contexts/authContext';
import { ThemeContext, ThemeContextValue } from './contexts/themeContext';
import { DEFAULT_THEME, ENVIRONMENT, EXPERIMENTAL_BACKGROUND, THEMES } from './config';
import { createPersistentQueryClient } from './utils/queryPersist';

const queryClient = createPersistentQueryClient();

// False on first load, true after first render. Resets on page refresh because
// the module is re-evaluated, but survives SPA navigations — so 'POP' on
// initial load is treated differently from browser back/forward.
let appHasNavigated = false;

// Forces SnippetPage to fully remount on each new :id so that GSAP styles,
// the directional enter-animation class, and navigatingRef all reset cleanly.
const SnippetPageRoute: FC = () => {
  const { id } = useParams<{ id: string }>();
  return <SnippetPage key={id} />;
};

type ThemePreferences = Pick<ThemeContextValue, 'showLineNumbers' | 'theme' | 'autoSize'>;

const getDefaultGlobalState = (): ThemePreferences => ({
    theme: window.localStorage.getItem('theme') || DEFAULT_THEME,
    showLineNumbers: window.localStorage.getItem('showLineNumbers') === 'true',
    autoSize: window.localStorage.getItem('autoSize') === 'true',
});

const App: FC = () => {
    const [globalState, setGlobalState] = useState<ThemePreferences>(getDefaultGlobalState);
    const createSnippetRef = useRef<CreateSnippetHandle>(null);
    const searchbarRef = useRef<SearchbarHandle>(null);
    const navigate = useNavigate();
    const navType = useNavigationType();
    useEffect(() => { appHasNavigated = true; }, []);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                createSnippetRef.current?.open();
            }
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                searchbarRef.current?.focus();
            }
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                navigate('/docs');
            }
            if (e.ctrlKey && (e.key === ']' || e.key === '[')) {
                e.preventDefault();
                setGlobalState((prev) => {
                    const idx = THEMES.indexOf(prev.theme);
                    const next =
                        e.key === ']'
                            ? THEMES[(idx + 1) % THEMES.length]
                            : THEMES[(idx - 1 + THEMES.length) % THEMES.length];
                    window.localStorage.setItem('theme', next);
                    console.log(next);
                    return { ...prev, theme: next };
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

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
        autoSize: globalState.autoSize,
        setAutoSize: (nextValue: boolean) => {
            setGlobalState((previous) => ({ ...previous, autoSize: nextValue }));
            window.localStorage.setItem('autoSize', String(nextValue));
        },
    };

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <GlassProvider>
                <ThemeContext.Provider value={value}>
                    <Spinner />
                    <div className={`App${navType === 'POP' && appHasNavigated ? ' app--restore' : ''}`}>
                        {EXPERIMENTAL_BACKGROUND && <BackgroundAnimation />}
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <>
                                        <div className="app-shell">
                                            <header className="app-hero">
                                                <p className="app-kicker">
                                                    Deep-Focus Code Archive
                                                </p>
                                                <h1 className="app-title">
                                                    <span>Snippets</span>
                                                </h1>
                                                <p className="app-subtitle">
                                                    A spacious, low-light workspace for the
                                                    fragments you return to most. The interface
                                                    stays quiet so the code itself can take the
                                                    room.
                                                </p>
                                                <div className="app-toolbar">
                                                    <CreateSnippet ref={createSnippetRef} />
                                                    <Preferences />
                                                    <GlassPill as={Link} to="/favorites" size="lg">
                                                        <i className="icon-star-empty" />
                                                        <span>Favorites</span>
                                                    </GlassPill>
                                                    <GlassPill as={Link} to="/docs" size="lg">
                                                        <i className="icon-info" />
                                                        <span>Shortcuts</span>
                                                    </GlassPill>
                                                </div>
                                                <div className="mt-8 flex justify-end">
                                                    <GoogleAuth />
                                                </div>
                                            </header>
                                            <Snippets searchbarRef={searchbarRef} />
                                        </div>
                                        <footer className="app-footer">
                                            <p className="app-footer-text">
                                                © {new Date().getFullYear()} Snippets · Deep-Focus
                                                Code Archive
                                            </p>
                                        </footer>
                                    </>
                                }
                            />
                            <Route path="/snippets/:id" element={<SnippetPageRoute />} />
                            <Route path="/language/:language" element={<LanguagePage />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/docs" element={<Docs />} />
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
