import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
      '@codemirror/theme-one-dark',
      '@uiw/react-codemirror',
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.tsx',
    globals: true,
    testTimeout: 15000,
  },
});
