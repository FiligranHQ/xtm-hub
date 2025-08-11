import react from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';
import relay from 'vite-plugin-relay';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths() as PluginOption,
    react() as PluginOption,
    relay as PluginOption,
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup-vitest.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.mjs',
        '**/*.config.*',
        '**/__generated__/**',
        '*.lintstagedrc.js',
        'middleware.ts',
      ],
    },
  },
});
