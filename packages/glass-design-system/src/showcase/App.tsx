import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { GlassPill } from 'glass-design-system';
import GlassShowcase from './pages/GlassShowcase';
import Philosophy from './pages/Philosophy';
import TypeShowcase from './pages/TypeShowcase';
import ColorShowcase from './pages/ColorShowcase';
import ProductDemo from './pages/ProductDemo';

const App: React.FC = () => (
  <div style={{ minHeight: '100vh' }}>
    <nav
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '1.5rem',
        zIndex: 100,
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      <GlassPill as={Link} to="/" size="sm">Glass</GlassPill>
      <GlassPill as={Link} to="/philosophy" size="sm">Philosophy</GlassPill>
      <GlassPill as={Link} to="/type" size="sm">Type</GlassPill>
      <GlassPill as={Link} to="/colors" size="sm">Colors</GlassPill>
      <GlassPill as={Link} to="/product" size="sm">Product</GlassPill>
    </nav>
    <Routes>
      <Route path="/" element={<GlassShowcase />} />
      <Route path="/philosophy" element={<Philosophy />} />
      <Route path="/type" element={<TypeShowcase />} />
      <Route path="/colors" element={<ColorShowcase />} />
      <Route path="/product" element={<ProductDemo />} />
    </Routes>
  </div>
);

export default App;
