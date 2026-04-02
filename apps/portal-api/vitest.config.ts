import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^graphql$/,
        replacement: 'graphql/index.js',
      },
    ],
  },
  test: {
    globals: true,
    globalSetup: './tests/config-test.ts',
    setupFiles: './tests/setup-test.ts',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      exclude: [
        'builder/**',
        'src/__generated__/**',
        'src/migrations/**',
        'src/es-migrations/**',
        'src/seeds/**',
        'tests/**',
        'config/**',
        '.kanelrc.js',
        '**/*.config.*',
        '**/*.d.ts',
        '**/*.mjs',
      ],
    },
  },
  plugins: [], // only if you are using custom tsconfig paths
});
