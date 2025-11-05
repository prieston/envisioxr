import { defineConfig } from 'tsup';
import { execSync } from 'child_process';

export default defineConfig({
  entry: ['src/index.ts', 'src/loader.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: { entry: ['src/index.ts', 'src/loader.ts'], resolve: false },
  sourcemap: true,
  treeshake: true,
  minify: true,
  target: 'es2020',
  platform: 'browser',
  bundle: true,
  skipNodeModulesBundle: true,
  external: [
    /^@envisio\/core$/,
    /^react$/,
    /^react-dom$/,
    /^cesium$/,
    /^react-toastify$/,
  ],
  tsconfig: './tsconfig.json',
  esbuildOptions(options) {
    options.logOverride = { 'this-is-undefined-in-esm': 'silent' };
    // Temporarily disabled for debugging: options.drop = ['console', 'debugger'];
  },
  async onSuccess() {
    // Copy vendor files to dist
    try {
      execSync('cp -R src/vendor dist/vendor', { stdio: 'inherit' });
    } catch (e) {
      // Ignore if vendor doesn't exist
    }
  },
});
