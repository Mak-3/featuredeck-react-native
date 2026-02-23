import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // External ALL dependencies - they'll be resolved from host app
  external: ['react', 'react-native', 'zustand'],
  treeshake: true,
  minify: false,
  // Ensure proper JSX transform
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
