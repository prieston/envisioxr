import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/index.ts',
    'src/components/ModelPreview.tsx',
  ],
  outDir: 'dist',
  format: ['esm'],
  dts: {
    entry: ['src/index.ts', 'src/components/index.ts', 'src/components/ModelPreview.tsx'],
    resolve: false
  },
  sourcemap: true,
  treeshake: true,
  minify: true,
  target: 'es2020',
  platform: 'browser',
  bundle: true,
  skipNodeModulesBundle: true,
  external: [
    /^@envisio\/core$/,
    /^@envisio\/ui$/,
    /^@envisio\/engine-cesium$/,
    /^react$/,
    /^react-dom$/,
    /^@mui\/material$/,
    /^@react-three\/fiber$/,
    /^@react-three\/drei$/,
    /^@react-spring\/three$/,
    /^three$/,
  ],
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.logOverride = { 'this-is-undefined-in-esm': 'silent' };
    options.drop = ['console', 'debugger'];
  },
});
