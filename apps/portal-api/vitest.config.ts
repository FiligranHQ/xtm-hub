import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/config-test.ts',
    setupFiles: './tests/setup-test.ts',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
    },
  },
  plugins: [], // only if you are using custom tsconfig paths
});
