# Build System Refactor - Complete ✅

## Summary

Successfully refactored monorepo build system from TypeScript compiler (`tsc`) to `tsup` for faster builds with extension-less imports and clean ESM output.

## ✅ All Changes Complete

### 1. Split TypeScript Configs

- ✅ Created `tsconfig.lib.base.json` at root (no composite, no paths to src)
- ✅ Updated `tsconfig.base.json` - removed all `@envisio/*` src paths
- ✅ All library `tsconfig.json` files extend lib base with `noEmit: true`

### 2. Libraries Use tsup

- ✅ Added `tsup@^8.0.0` to root devDependencies
- ✅ Created `tsup.config.ts` for all 6 libraries with proper external patterns
- ✅ All libraries build successfully: `core`, `config`, `ui`, `ion-sdk`, `engine-cesium`, `engine-three`

### 3. Package.json Updates

- ✅ All libraries set `"type": "module"`
- ✅ All have clean `exports` maps pointing to `dist/**`
- ✅ All set `"files": ["dist"]`
- ✅ Build scripts: `"build": "tsup"`
- ✅ Clean scripts: `"clean": "rimraf dist *.tsbuildinfo"`

### 4. Root Scripts

- ✅ `build:packages`: Uses `pnpm -r --filter './packages/*' --workspace-concurrency=1 run build` (sequential, topo-aware)
- ✅ `validate`: Includes `syncpack:check`, `typecheck`, `lint`
- ✅ Added `check:tarball` script

### 5. ESLint

- ✅ Added `import/extensions` rule (no extensions in imports)
- ✅ Added `eslint-plugin-import` and resolver

### 6. Fixed All Import Issues

- ✅ Removed all subpath imports from internal libs (`@envisio/core/utils/logger` → `@envisio/core`)
- ✅ Added explicit exports in `packages/core/src/index.ts` for logger
- ✅ Fixed `engine-three` to import from root (`@envisio/engine-cesium` not `@envisio/engine-cesium/components`)
- ✅ Fixed `engine-three` dependencies: moved `@envisio/ui` and `@envisio/engine-cesium` to `dependencies` (not just `peerDependencies`)

### 7. tsup DTS Configuration

- ✅ Set `dts: { entry: 'src/index.ts', resolve: false }` for packages importing other `@envisio/*` packages
- ✅ This prevents cross-package type inlining that causes "not listed within file list" errors
- ✅ All packages marked with proper `external` patterns

## Build Status: ✅ All Green

All packages build successfully:

- `@envisio/core` ✅
- `@envisio/config` ✅
- `@envisio/ui` ✅
- `@envisio/ion-sdk` ✅ (with vendor copy)
- `@envisio/engine-cesium` ✅
- `@envisio/engine-three` ✅

## Vercel Configuration

**Install Command**: `pnpm install --frozen-lockfile --prod=false`

**Build Command** (for `apps/editor`):

```bash
cd ../.. && pnpm vercel:build:editor
```

**Output Directory**: `.next`

**Node Version**: 20.x

## How to Run Local Builds

```bash
# Clean all artifacts
pnpm clean

# Build all packages (sequential, respects dependency order)
pnpm build:packages

# Build specific package
pnpm --filter @envisio/core build

# Build apps (automatically builds packages first)
pnpm build:editor
pnpm build:website

# Full validation
pnpm validate

# Check for clean working tree
pnpm check:clean
```

## Key Architectural Decisions

1. **tsup handles all emit**: Libraries set `noEmit: true` in tsconfig, tsup generates JS + DTS
2. **No composite/project references**: Removed from lib configs to avoid conflicts with tsup bundling
3. **External workspace packages**: All `@envisio/*` packages marked as external in tsup configs
4. **Extension-less imports**: `moduleResolution: Bundler` allows imports without `.ts`/`.js` extensions
5. **Dist-only exports**: All package.json exports point to `dist/**`, never `src/**`
6. **Sequential builds**: `--workspace-concurrency=1` ensures dependencies build before dependents
7. **No subpath imports**: All imports from workspace packages use root imports only

## CI Order

1. `pnpm check:clean` - Ensure clean working tree
2. `pnpm validate` - syncpack check + typecheck + lint
3. `pnpm build:packages` - Build all libraries (sequential)
4. `pnpm build:editor` - Build editor app
5. `pnpm build:website` - Build website app
6. `pnpm size:editor` - Check bundle size
7. `pnpm size:website` - Check bundle size
8. `pnpm e2e:ci:website` - Run website E2E tests
9. `pnpm e2e:ci:editor` - Run editor E2E tests

## Notes

- Libraries use `moduleResolution: Bundler` which allows extension-less imports in `src/**`
- Apps continue using Next.js 14 + Webpack (no changes to app build process)
- All libraries resolve each other via package names (`@envisio/core`, etc.), not paths
- Vendor files in `ion-sdk` are copied to `dist/vendor` via tsup's `onSuccess` hook
- `resolve: false` in DTS config prevents TypeScript from trying to inline types from external packages
