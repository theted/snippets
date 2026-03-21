import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import Icon from '../components/Icon';
import Snippets from './Snippets';
import { LANGUAGE_MAP } from '../config';

const LanguagePage: React.FC = () => {
  const { language = '' } = useParams<{ language: string }>();
  const displayName = LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP] ?? language;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    document.title = `${displayName} — Snippets`;
    return () => { document.title = 'Snippets'; };
  }, [displayName]);

  return (
    <>
      <div className="app-shell">
        <header className="app-hero">
          <p className="app-kicker">Language Archive</p>
          <h1 className="app-title">
            <span>{displayName}</span>
          </h1>
          <p className="app-subtitle">
            All snippets written in {displayName}.
          </p>
          <div className="app-toolbar">
            <GlassPill as={Link} to="/" size="lg" className="whitespace-nowrap">
              <Icon name="home" />
              <span>All snippets</span>
            </GlassPill>
          </div>
        </header>
        <Snippets key={language} initialLanguage={language} />
      </div>
      <footer className="app-footer">
        <p className="app-footer-text">
          © {new Date().getFullYear()} Snippets · Deep-Focus Code Archive
        </p>
      </footer>
    </>
  );
};

export default LanguagePage;
