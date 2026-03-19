import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/showcase'),
  resolve: {
    alias: {
      'glass-design-system': resolve(__dirname, 'src/index.ts'),
    },
  },
});
