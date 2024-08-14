import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts']
    }
  },
});
