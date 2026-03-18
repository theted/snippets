import React, { useState, useRef, useEffect, FC } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import CreateSnippet, { CreateSnippetHandle } from './pages/CreateSnippet';
import Snippets from './pages/Snippets';
import { SearchbarHandle } from './components/Searchbar';
import Preferences from './pages/Preferences';
import SnippetPage from './pages/SnippetPage';
import Docs from './pages/Docs';
import GoogleAuth from './components/GoogleAuth';
import Spinner from './components/Spinner';
import BackgroundAnimation from './components/BackgroundAnimation';
import { AuthProvider } from './contexts/authContext';
import { ThemeContext, ThemeContextValue } from './contexts/themeContext';
import { DEFAULT_THEME, ENVIRONMENT, EXPERIMENTAL_BACKGROUND, THEMES } from './config';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000, // data stays fresh for 1 min — no background refetch on every nav
            gcTime: 5 * 60_000, // keep unused cache entries for 5 min
            retry: 1,
        },
    },
});

type ThemePreferences = Pick<ThemeContextValue, 'showLineNumbers' | 'theme'>;

const getDefaultGlobalState = (): ThemePreferences => ({
    theme: window.localStorage.getItem('theme') || DEFAULT_THEME,
    showLineNumbers: window.localStorage.getItem('showLineNumbers') === 'true',
});

const App: FC = () => {
    const [globalState, setGlobalState] = useState<ThemePreferences>(getDefaultGlobalState);
    const [heroMousePos, setHeroMousePos] = useState({ x: 50, y: 50 });
    const [heroHovered, setHeroHovered] = useState(false);
    const createSnippetRef = useRef<CreateSnippetHandle>(null);
    const searchbarRef = useRef<SearchbarHandle>(null);
    const navigate = useNavigate();

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHeroMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

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
    };

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeContext.Provider value={value}>
                    <Spinner />
                    <div className="App">
                        {EXPERIMENTAL_BACKGROUND && <BackgroundAnimation />}
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <>
                                        <div className="app-shell">
                                            <header
                                                className="app-hero"
                                                onMouseMove={handleHeroMouseMove}
                                                onMouseEnter={() => setHeroHovered(true)}
                                                onMouseLeave={() => setHeroHovered(false)}
                                            >
                                                {/* Ambient hover glow — very blurred, follows mouse */}
                                                <div
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                                                    style={{
                                                        background: `radial-gradient(ellipse 60% 50% at ${heroMousePos.x}% ${heroMousePos.y}%, oklch(0.62 0.18 240 / 0.05) 0%, transparent 70%)`,
                                                        filter: 'blur(32px)',
                                                        opacity: heroHovered ? 1 : 0,
                                                    }}
                                                />
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
                                                    <Link
                                                        to="/docs"
                                                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] text-bevel transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-soft)]"
                                                    >
                                                        <i className="icon-info" />
                                                        <span>Shortcuts</span>
                                                    </Link>
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
                            <Route path="/snippets/:id" element={<SnippetPage />} />
                            <Route path="/docs" element={<Docs />} />
                        </Routes>
                    </div>
                </ThemeContext.Provider>
            </AuthProvider>
            {ENVIRONMENT === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};

export default App;
