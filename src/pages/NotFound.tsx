import React from 'react';
import { Link } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import Kicker from '../components/Kicker';

const NotFound: React.FC = () => (
  <div className="App">
    <div className="relative z-1 mx-auto flex min-h-screen w-full max-w-[100rem] flex-col items-center justify-center gap-8 px-[clamp(1.25rem,4vw,4rem)] text-center">
      <Kicker>Error 404</Kicker>
      <h1 className="font-[var(--font-display)] text-[clamp(6rem,20vw,16rem)] font-[250] leading-none tracking-[-0.06em] text-[var(--color-text)] text-bevel-strong opacity-20">
        404
      </h1>
      <p className="mt-2 max-w-md text-[var(--color-text-muted)]">
        This page doesn't exist — or it may have been moved.
      </p>
      <GlassPill as={Link} to="/" size="lg">
        <i className="icon-home" style={{ fontSize: '0.85em' }} />
        Back to archive
      </GlassPill>
    </div>
  </div>
);

export default NotFound;
