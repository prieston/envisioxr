import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: { entry: 'src/index.ts', resolve: true },
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
    /^react-toastify$/,
    /^@mui\/material$/,
    /^@mui\/icons-material$/,
    /^@emotion\/react$/,
    /^@emotion\/styled$/,
    /^@react-three\/fiber$/,
    /^@react-three\/drei$/,
    /^three$/,
    /^react-dropzone$/,
  ],
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.logOverride = { 'this-is-undefined-in-esm': 'silent' };
    options.drop = ['console', 'debugger'];
  },
});
