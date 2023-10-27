import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/functions/app/api/**/**/*.{test,spec}.{js,ts}'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // globals: true,
    // environment: 'jsdom',
  },
  plugins: [tsconfigPaths({ root: '../' })],
  // globalSetup: ['packages/functions/app/api/globalSetup.ts'],
});
