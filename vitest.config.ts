import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/tools/generate-email-theme/**'],
      exclude: ['**/*.test.ts'],
      thresholds: {
        statements: 95,
        functions: 95,
        lines: 95,
        branches: 90,
      },
    },
  },
});
