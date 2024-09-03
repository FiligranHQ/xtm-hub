import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/config-test.ts',
    poolOptions: {
      threads: {
        singleThread: true,
      },
      fork: {
        singleFork: true,
      },
    },
  },
  plugins: [], // only if you are using custom tsconfig paths
});
