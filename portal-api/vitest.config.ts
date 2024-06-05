import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [], // only if you are using custom tsconfig paths
});
