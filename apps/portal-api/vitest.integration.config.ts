import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/config-test.ts',
    setupFiles: './tests/setup-test.ts',
    exclude: [
      '**/node_modules/**',
      '**/*{util,utils,helper,helpers,pure,mock,stub,constant,constants,types}.{spec,test}.{ts,tsx}',
    ],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      exclude: [
        'builder/**',
        'src/__generated__/**',
        'src/migrations/**',
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
