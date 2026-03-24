import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/lang-javascript',
      '@codemirror/lang-python',
      '@codemirror/lang-css',
      '@codemirror/lang-sql',
      '@codemirror/lang-yaml',
      '@codemirror/lang-markdown',
      '@codemirror/lang-php',
      '@codemirror/legacy-modes/mode/go',
      '@codemirror/legacy-modes/mode/clike',
      '@codemirror/legacy-modes/mode/dockerfile',
      '@codemirror/legacy-modes/mode/css',
      '@codemirror/legacy-modes/mode/sass',
      '@codemirror/legacy-modes/mode/stylus',
      '@codemirror/legacy-modes/mode/shell',
      '@codemirror/legacy-modes/mode/ruby',
      '@codemirror/legacy-modes/mode/rust',
      '@codemirror/legacy-modes/mode/haskell',
      '@codemirror/legacy-modes/mode/perl',
      '@codemirror/theme-one-dark',
      '@uiw/react-codemirror',
    ],
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './src/setupTests.tsx',
    globals: true,
    testTimeout: 15000,
    pool: 'forks',
  },
});
