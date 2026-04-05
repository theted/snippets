import { useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import type { CreateSnippetHandle } from '../pages/CreateSnippet';
import CreateSnippet from '../pages/CreateSnippet';
import type { SearchbarHandle } from './Searchbar';
import Preferences from '../pages/Preferences';
import Snippets from '../pages/Snippets';
import GoogleAuth from './GoogleAuth';
import Icon from './Icon';

type Props = {
  createSnippetRef: RefObject<CreateSnippetHandle | null>;
  searchbarRef: RefObject<SearchbarHandle | null>;
};

const archiveLinks = [
  { to: '/favorites', icon: 'star-empty', label: 'Favorites' },
  { to: '/docs', icon: 'info', label: 'Shortcuts' },
  { to: '/stats', icon: 'chart', label: 'Status' },
] as const;

type ArchiveLinkPillsProps = {
  size: 'lg' | 'md';
  className: string;
  onClick?: () => void;
};

const ArchiveLinkPills = ({ size, className, onClick }: ArchiveLinkPillsProps) => (
  <>
    {archiveLinks.map(({ to, icon, label }) => (
      <GlassPill
        key={to}
        as={Link}
        to={to}
        size={size}
        className={className}
        onClick={onClick}
      >
        <Icon name={icon} />
        <span>{label}</span>
      </GlassPill>
    ))}
  </>
);

const HomePage = ({ createSnippetRef, searchbarRef }: Props) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((value) => !value);

  return (
    <>
      <div className="app-shell">
        <header className="app-hero">
          <p className="app-kicker">Deep-Focus Code Archive</p>
          <h1 className="app-title">
            <span>Snippets</span>
          </h1>
          <p className="app-subtitle">
            A spacious, low-light workspace for the fragments you return to most. The interface
            stays quiet so the code itself can take the room.
          </p>
          <div className="app-toolbar">
            <div className="hidden sm:contents">
              <CreateSnippet ref={createSnippetRef} />
              <Preferences />
              <ArchiveLinkPills size="lg" className="whitespace-nowrap" />
            </div>

            <div className="relative sm:hidden">
              <GlassPill
                size="md"
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
                <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Menu'}</span>
              </GlassPill>

              <div
                className={[
                  'absolute left-0 top-full mt-2 z-50 w-64',
                  'transition-all duration-200 ease-out origin-top-left',
                  mobileMenuOpen
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 scale-95 pointer-events-none',
                ].join(' ')}
              >
                <div className="mobile-menu-panel">
                  <CreateSnippet />
                  <Preferences />
                  <ArchiveLinkPills
                    size="md"
                    className="w-full justify-start"
                    onClick={closeMobileMenu}
                  />
                </div>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 sm:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
          )}

          <div className="mt-8 flex justify-end">
            <GoogleAuth />
          </div>
        </header>

        <Snippets searchbarRef={searchbarRef} />
      </div>

      <footer className="app-footer">
        <p className="app-footer-text">
          © {new Date().getFullYear()} Snippets · Deep-Focus Code Archive
        </p>
      </footer>
    </>
  );
};

export default HomePage;
