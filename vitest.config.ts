import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      // '@/marketing/*': new URL('./src/app/[locale]/(marketing)/*', import.meta.url).pathname ],
      // '@/*': ['./src/*'],
      // '@/styles': [''],
      '@/entities': path.resolve(__dirname, './stacks/entities'),
      // '@/components/*': ['./src/components/*'],
      // 'app-api': ['./packages/functions/app/api/src'],
      // 'app-wsApi': ['./packages/functions/app/ws/src'],
      // mocks: ['./mocks'],
      // '@/public': ['./public'],
      // 'chat-widget': ['src/app/[locale]/(chat-widget)'],
    },
  },
  plugins: [tsconfigPaths()],
});
