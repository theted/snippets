import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import { BackgroundProvider, useBackground } from './context/BackgroundContext';
import BackgroundSwitcher from './components/BackgroundSwitcher';
import GlassShowcase from './pages/GlassShowcase';
import Philosophy from './pages/Philosophy';
import TypeShowcase from './pages/TypeShowcase';
import ColorShowcase from './pages/ColorShowcase';
import ProductDemo from './pages/ProductDemo';
import ComponentDocs from './pages/ComponentDocs';
import Portfolio from './pages/Portfolio';
import LayoutShowcase from './pages/LayoutShowcase';

// Inner component so it can consume the BackgroundContext
const AppInner: React.FC = () => {
  const { activeGradient, activePattern } = useBackground();
  const [topBarVisible, setTopBarVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const showBar = () => { clearTimeout(hideTimer.current); setTopBarVisible(true); };
  const scheduleHide = () => { hideTimer.current = setTimeout(() => setTopBarVisible(false), 300); };

  // Apply active gradient to body background; restore on unmount
  useEffect(() => {
    const prevBg = document.body.style.background;
    const prevAttachment = document.body.style.backgroundAttachment;
    const prevTransition = document.body.style.transition;
    document.body.style.transition = 'background 700ms ease';
    document.body.style.background = activeGradient;
    document.body.style.backgroundAttachment = 'fixed';
    return () => {
      document.body.style.background = prevBg;
      document.body.style.backgroundAttachment = prevAttachment;
      document.body.style.transition = prevTransition;
    };
  }, [activeGradient]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Pattern texture overlay — sits above gradient, below all content */}
      {activePattern.url && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9997,
            pointerEvents: 'none',
            backgroundImage: `url("${activePattern.url}")`,
            backgroundSize: activePattern.size,
            backgroundRepeat: 'repeat',
            mixBlendMode: 'soft-light',
            opacity: 0.22,
          }}
        />
      )}

      {/* Invisible sentinel — catches hover in the top 100px */}
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100px', zIndex: 199, pointerEvents: 'auto' }}
        onMouseEnter={showBar}
        onMouseLeave={scheduleHide}
      />

      {/* Auto-hide top bar */}
      <div
        className={`topbar-inner${topBarVisible ? ' topbar-visible' : ''}`}
        style={{ zIndex: 200 }}
        onMouseEnter={showBar}
        onMouseLeave={scheduleHide}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.5rem',
            gap: '1rem',
          }}
        >
          {/* Page nav */}
          <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <GlassPill as={Link} to="/" size="sm">Glass</GlassPill>
            <GlassPill as={Link} to="/components" size="sm">Components</GlassPill>
            <GlassPill as={Link} to="/philosophy" size="sm">Philosophy</GlassPill>
            <GlassPill as={Link} to="/type" size="sm">Type</GlassPill>
            <GlassPill as={Link} to="/colors" size="sm">Colors</GlassPill>
            <GlassPill as={Link} to="/product" size="sm">Product</GlassPill>
            <GlassPill as={Link} to="/portfolio" size="sm">Portfolio</GlassPill>
            <GlassPill as={Link} to="/layouts" size="sm">Layouts</GlassPill>
          </nav>

          {/* Background / pattern controls */}
          <BackgroundSwitcher />
        </div>
      </div>

      <Routes>
        <Route path="/" element={<GlassShowcase />} />
        <Route path="/components" element={<ComponentDocs />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/type" element={<TypeShowcase />} />
        <Route path="/colors" element={<ColorShowcase />} />
        <Route path="/product" element={<ProductDemo />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/layouts" element={<LayoutShowcase />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => (
  <BackgroundProvider>
    <AppInner />
  </BackgroundProvider>
);

export default App;
