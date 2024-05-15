import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), relay],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup-vitest.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
