import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/config-test.ts',
  },
  plugins: [], // only if you are using custom tsconfig paths
});
