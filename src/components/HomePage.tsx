import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { CreateSnippetHandle } from '../pages/CreateSnippet';
import CreateSnippet from '../pages/CreateSnippet';
import type { SearchbarHandle } from './Searchbar';
import Preferences from '../pages/Preferences';
import Snippets from '../pages/Snippets';
import AccountMenu from './account/AccountMenu';
import ArchiveLinkPills from './home/ArchiveLinkPills';
import HomeHero from './home/HomeHero';
import HomeMobileMenu from './home/HomeMobileMenu';

type Props = {
  createSnippetRef: RefObject<CreateSnippetHandle | null>;
  searchbarRef: RefObject<SearchbarHandle | null>;
};

const HomePage = ({ createSnippetRef, searchbarRef }: Props) => (
  <>
    <div className="app-shell">
      <div className="home-topbar">
        <nav className="hidden flex-wrap gap-2 sm:flex" aria-label="Archive">
          <ArchiveLinkPills size="sm" className="whitespace-nowrap" />
          <Preferences size="sm" />
        </nav>
        <HomeMobileMenu />
        <AccountMenu />
      </div>

      <HomeHero action={<CreateSnippet ref={createSnippetRef} />} />

      <Snippets searchbarRef={searchbarRef} />
    </div>

    <footer className="app-footer">
      <p className="app-footer-text">
        © {new Date().getFullYear()} Snippets · Deep-Focus Code Archive ·{' '}
        <Link to="/privacy" className="app-footer-link">Privacy</Link>
      </p>
    </footer>
  </>
);

export default HomePage;
