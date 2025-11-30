import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'utils/index': 'src/utils/index.ts',
    'types/index': 'src/types/index.ts',
  },
  outDir: 'dist',
  format: ['esm'],
  dts: {
    entry: ['src/index.ts', 'src/utils/index.ts', 'src/types/index.ts'],
    resolve: true
  },
  sourcemap: true,
  treeshake: true,
  minify: true,
  target: 'es2020',
  platform: 'browser',
  bundle: true,
  skipNodeModulesBundle: true,
  external: [
    /^react$/,
    /^react-dom$/,
    /^three$/,
    /^react-toastify$/,
    /^zustand$/,
    /^uuid$/,
  ],
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.logOverride = { 'this-is-undefined-in-esm': 'silent' };
    // Removed drop console to allow debug logging
    // options.drop = ['console', 'debugger'];
  },
});
