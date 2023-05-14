import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/functions/app/**/**/*.{test,spec}.{js,ts}'],
    testTimeout: 30000,
    // globalSetup: ['packages/functions/app/api/globalSetup.ts'],
  },
});
