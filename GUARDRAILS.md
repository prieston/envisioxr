# Guardrails Documentation

## ✅ Implemented Guardrails

### 1. Automated Smoke Tests (Playwright)

**Location**: `apps/*/tests/smoke.spec.ts`

**Tests**:

- ✅ No hydration warnings
- ✅ No console errors
- ✅ Cesium workers & assets resolve (editor only)
- ✅ No duplicate React detection

**Scripts**:

- `pnpm e2e:editor` - Run editor smoke tests
- `pnpm e2e:website` - Run website smoke tests
- `pnpm e2e` - Run all smoke tests
- `pnpm e2e:ci:editor` - CI-friendly (builds, starts server, runs tests)
- `pnpm e2e:ci:website` - CI-friendly (builds, starts server, runs tests)

**Configuration**: `playwright.config.ts`

### 2. Bundle Analysis & Size Budgets

**Bundle Analyzer**:

- Enabled via `ANALYZE=true` environment variable
- Shows bundle composition and sizes
- Scripts: `pnpm analyze:editor`, `pnpm analyze:website`

**Size Limits**:

- `apps/editor/.size-limit.json` - Editor bundle budgets
- `apps/website/.size-limit.json` - Website bundle budgets
- Scripts: `pnpm size:editor`, `pnpm size:website`
- Fails CI if bundles exceed limits

**Console Stripping**:

- Production builds automatically strip `console.*` statements
- Configured via TerserPlugin in `next.config.mjs`
- Prevents console output in production bundles

### 3. Cesium Hardening

**Environment Configuration**:

- `CESIUM_BASE_URL` exported at build time via `next.config.mjs`
- Default: `/cesium`
- Runtime check with dev warning if misconfigured

**Asset Handling**:

- Cesium assets pre-copied to `public/cesium/`
- Workers served statically from `/cesium/Workers/`
- Assets accessible from `/cesium/Assets/`

**Runtime Exposure**:

- `window.cesiumViewer` exposed after initialization
- Enables smoke tests to probe viewer state
- `window.CESIUM_BASE_URL` set for worker resolution

**Implementation**:

- Editor: `apps/editor/next.config.mjs` - Cesium webpack config
- Engine: `packages/engine-cesium/src/CesiumViewer.tsx` - Runtime checks

## 🔄 CI Gate Order

When implementing CI, use this order:

```bash
# 1. Check dependency consistency
pnpm syncpack:check

# 2. Type check
pnpm typecheck

# 3. Build packages
pnpm build:packages

# 4. Build apps
pnpm build:editor
pnpm build:website

# 5. Check bundle sizes
pnpm size:editor
pnpm size:website

# 6. Run smoke tests
pnpm e2e:ci:website
pnpm e2e:ci:editor
```

## 📋 Usage Examples

### Local Development

```bash
# Run smoke tests (requires dev servers running)
pnpm e2e:editor
pnpm e2e:website

# Analyze bundle sizes
pnpm analyze:editor
pnpm analyze:website

# Check bundle sizes
pnpm size:editor
pnpm size:website
```

### CI/CD

```bash
# Full CI gate sequence
pnpm syncpack:check && \
pnpm typecheck && \
pnpm build:packages && \
pnpm build:editor && \
pnpm build:website && \
pnpm size:editor && \
pnpm size:website && \
pnpm e2e:ci:website && \
pnpm e2e:ci:editor
```

## ⚠️ Notes

- **Smoke tests** require apps to be running or use `start-server-and-test`
- **Bundle analyzer** generates HTML reports (opens automatically in browser)
- **Size limits** may need adjustment based on actual bundle sizes
- **Cesium assets** are committed to git (not copied during build)

---

**Status**: ✅ All guardrails implemented
**Next**: Proceed with cleanup phases (Phase 2-4)
