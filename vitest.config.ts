import { defineConfig } from 'vitest/config';
import path from 'path';

const config = {
  test: {
    environment: 'jsdom',
    include: [
      'tests/**/*.{test,spec,prop}.ts',
      'tests/**/*.{test,spec,prop}.tsx',
    ],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  oxc: false,
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
};

export default defineConfig(config as any);
