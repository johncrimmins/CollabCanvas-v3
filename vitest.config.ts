import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    root: __dirname,
    include: ['./src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      'node_modules/**',
      '.cursor/**',
      'AppData/**',
      '**/Local Settings/**',
      '**/Application Data/**',
      '**/.cursor/**',
      '**/AppData/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

