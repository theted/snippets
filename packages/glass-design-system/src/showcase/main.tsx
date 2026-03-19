import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GlassProvider } from 'glass-design-system';
import './showcase.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlassProvider>
        <App />
      </GlassProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
