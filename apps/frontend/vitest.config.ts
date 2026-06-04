import react from '@vitejs/plugin-react';
import type { Plugin, PluginOption } from 'vite';
import relay from 'vite-plugin-relay';
import { defineConfig } from 'vitest/config';

const cssStubPlugin: Plugin = {
  name: 'css-stub',
  transform(_code, id) {
    if (id.endsWith('.css')) {
      return { code: 'export default {}' };
    }
  },
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ['@filigran/ui', /@uiw\/.*/],
  },
  plugins: [react() as PluginOption, relay as PluginOption, cssStubPlugin],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup-vitest.ts',
    include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['./src/**', './app/**'],
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
