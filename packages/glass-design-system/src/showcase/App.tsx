import React, { useEffect } from 'react';
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

// Inner component so it can consume the BackgroundContext
const AppInner: React.FC = () => {
  const { activeGradient, activePattern } = useBackground();

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

      {/* Global background switcher — fixed top-right */}
      <BackgroundSwitcher />

      {/* Page nav — fixed top-left */}
      <nav
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 200,
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <GlassPill as={Link} to="/" size="sm">Glass</GlassPill>
        <GlassPill as={Link} to="/components" size="sm">Components</GlassPill>
        <GlassPill as={Link} to="/philosophy" size="sm">Philosophy</GlassPill>
        <GlassPill as={Link} to="/type" size="sm">Type</GlassPill>
        <GlassPill as={Link} to="/colors" size="sm">Colors</GlassPill>
        <GlassPill as={Link} to="/product" size="sm">Product</GlassPill>
      </nav>

      <Routes>
        <Route path="/" element={<GlassShowcase />} />
        <Route path="/components" element={<ComponentDocs />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/type" element={<TypeShowcase />} />
        <Route path="/colors" element={<ColorShowcase />} />
        <Route path="/product" element={<ProductDemo />} />
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
