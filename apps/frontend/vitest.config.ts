import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import type { PluginOption } from 'vite';
import relay from 'vite-plugin-relay';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@graphql': fileURLToPath(new URL('./graphql', import.meta.url)),
      '@generated': fileURLToPath(new URL('./__generated__', import.meta.url)),
      '@styles': fileURLToPath(new URL('./styles', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
      '@app': fileURLToPath(new URL('./app', import.meta.url)),
      '@messages': fileURLToPath(new URL('./messages', import.meta.url)),
    },
  },
  ssr: {
    noExternal: ['@filigran/ui', /@uiw\/.*/],
  },
  plugins: [react() as PluginOption, relay as PluginOption],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup-vitest.ts',
    include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: [
          /@filigran\/ui/,
          '@uiw/react-md-editor',
          '@uiw/react-markdown-preview',
        ],
      },
    },
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
