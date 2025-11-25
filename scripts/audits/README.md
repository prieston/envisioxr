# Audit Pipeline Documentation

This directory contains automated audit scripts to prevent common code quality and architecture issues.

## Tier A — Lightweight Audits (run in Vercel & locally)

### 1. Package Boundaries & Exports (`boundaries.ts`)
**Goal**: Prevent src/ leaks, wrong exports, and cross-layer imports

**Checks**:
- Each workspace package exports only from `dist/**`. Fail if any `package.json` exports or main/types point to `src/**`
- No app imports `@envisio/*/src/**` or deep internals (`/dist/chunk-*`)
- No forbidden cross-layer imports (apps/* importing from packages/*/src or UI importing Cesium directly)

**Usage**: `pnpm audit:boundaries`

### 2. SSR/Client Import Guards (`ssr-guards.ts`)
**Goal**: Prevent server from pulling 3D/DOM-only libs

**Checks**:
- In server/route/layout files (RSC, API, page.tsx without "use client"), ban imports of: `three`, `@react-three/*`, `cesium`, `@cesium/*`, `3d-tiles-renderer`, `mapbox-gl`, `react-dom`, `window/document` usage
- Allow only dynamic imports with `ssr:false` from client components

**Usage**: `pnpm audit:ssr`

### 3. File Size & Component Complexity (`size-complexity.ts`)
**Goal**: Stop "god files/components"

**Checks** (thresholds):
- File lines: warn ≥ 300, fail > 500
- React component LOC: warn ≥ 200, fail > 350
- Props count: warn ≥ 12 props, fail > 16
- Cyclomatic complexity (function): warn ≥ 10, fail > 15

**Usage**: `pnpm audit:size`

### 4. Type-Safety Hot-Spots (`types.ts`)
**Goal**: Keep `any` from creeping back into core/editor hotspots

**Checks**:
- In `apps/editor/app/components/Builder/**` and `packages/*/src/**`:
  - Fail if `any` is used in prop types or exported public APIs
  - Warn for `Record<string, any>` → suggest `unknown`

**Usage**: `pnpm audit:types`

### 5. Dead Exports (`dead-exports.ts`)
**Goal**: Remove bloat that harms treeshaking

**Checks**:
- Unused TypeScript exports across workspaces
- Uses `ts-prune` if available

**Usage**: `pnpm audit:dead`

## Tier B — Heavy Audits (GitHub Action only)

### 6. Circular & Forbidden Dependency Graph (`graph.ts`)
**Goal**: Avoid cycles and enforce allowed directions

**Checks**:
- Fail on any circular import
- Enforce graph rules:
  - `@envisio/core` → no internal deps
  - `@envisio/ion-sdk` → may depend on core only (peer)
  - `@envisio/engine-cesium|engine-three` → may depend on core, ion-sdk, ui
  - `apps/*` → can depend on all `@envisio/*`, not vice-versa

**Usage**: `pnpm audit:graph`
**Dependencies**: Requires `madge` (`pnpm add -D madge`)

### 7. Bundle Size Guardrails (`bundle.ts`)
**Goal**: Keep runtime payload predictable

**Checks** (after `next build`):
- Vendor chunk ≤ 2.5 MB (fail if > 3.0 MB)
- First Load JS:
  - `/projects/[id]/builder` ≤ 2.6 MB warn, 3.0 MB fail
  - `/dashboard` ≤ 2.2 MB warn, 2.6 MB fail
- Flag PWA precache skips (files > maximumFileSizeToCacheInBytes)

**Usage**: `pnpm audit:bundle` (requires `pnpm build:editor` first)

### 8. Externalization & PeerDeps (`externalization.ts`)
**Goal**: Ensure heavy libs aren't bundled accidentally

**Checks**:
- For each `packages/*/tsup.config.ts`:
  - `external` must include `cesium`, `@cesium/*`, `three`, `@react-three/*`, `zustand`, `uuid` (as applicable)
- For each `package.json`:
  - If a module appears in `external`, it must be listed in `peerDependencies` (or `dependencies` if truly required at runtime)
- Fail if mismatch or missing externalization

**Usage**: `pnpm audit:external`

### 9. Env & Secrets Schema (`env.ts`)
**Goal**: Prevent missing keys and region mismatches

**Checks**:
- Validate `.env.production` (or `process.env` in CI) against schema:
  - Required: `NEXTAUTH_URL`, `DATABASE_URL`, `ION_ACCESS_TOKEN`, `ION_REGION` in `{ 'us-east-1' | 'eu-central-1' }`
- Fail if missing/invalid; print a masked diff

**Usage**: `pnpm audit:env`

## Tier C — Performance Audits (Cesium-Specific)

### 10. Render Loop & Scheduling (`renderloop.ts`)
**Goal**: Prevent unnecessary renders and per-frame allocations

**Checks**:
- `viewer.scene.requestRenderMode` not set to `true`
- Unnecessary `viewer.render()` or `requestRender()` calls
- Stray `setInterval`/`setTimeout`/`rAF` driving continuous renders
- Per-frame allocations in animation callbacks (`preUpdate`, `postRender`, etc.)
- `requestRender()` calls without proper guards

**Usage**: `pnpm audit:renderloop`

### 11. WebGL Resource Lifecycle (`webgl.ts`)
**Goal**: Prevent WebGL memory leaks

**Checks**:
- Textures, framebuffers, materials not destroyed
- `PrimitiveCollections` and `PostProcessStage` chains not cleaned up
- `ImageryLayers` removed but not destroyed
- `DataSources` removed without `destroy=true`
- Geometry buffers not released
- `ImageryProvider`/`TerrainProvider` changes without cleanup

**Usage**: `pnpm audit:webgl`

### 12. 3D Tiles Configuration (`tiles.ts`)
**Goal**: Optimize tileset performance and prevent leaks

**Checks**:
- Missing tileset configuration (`maximumScreenSpaceError`, `baseScreenSpaceError`, `skipLevelOfDetail`, `maximumMemoryUsage`)
- Tilesets left attached but hidden
- Multiple overlapping tilesets (duplicates)
- Tilesets without explicit `destroy()` on unmount
- Pathological per-frame style/feature property writes
- Missing event unsubscriptions (`ready`, `tileLoad`, etc.)

**Usage**: `pnpm audit:tiles`

### 13. Viewer/Scene Configuration (`viewer.ts`)
**Goal**: Ensure optimal viewer settings

**Checks**:
- Missing `targetFrameRate` or `maximumRenderTimeChange`
- FXAA enabled at high DPI without check
- Unnecessary global shadows/`depthTestAgainstTerrain`
- Duplicate `ScreenSpaceEventHandlers`
- Resolution scale > 1.0 (unnecessary upscaling)
- `logarithmicDepthBuffer` toggled every frame

**Usage**: `pnpm audit:viewer`

### 14. Hydration & SSR/CSR Mismatch (`hydration.ts`)
**Goal**: Prevent Next.js hydration errors and double mounts

**Checks**:
- Cesium components rendered on server (missing `"use client"`)
- `window`/`document` usage in RSC
- Cesium imports in server components
- `useEffect` creating Cesium resources without mount guard (double mount)
- Dynamic imports without `ssr: false` for Cesium
- Metadata exports in client components

**Usage**: `pnpm audit:hydration`

### 15. Virtualization & List Rendering (`lists.ts`)
**Goal**: Optimize list rendering performance

**Checks**:
- Large arrays (>50 items) mapped directly into JSX without virtualization
- Objects/arrays passed inline in props (breaks `React.memo`)
- Missing pagination for large data sets
- Filter/map chains without `useMemo`

**Usage**: `pnpm audit:lists`

### 16. Network & Tiling (`network.ts`)
**Goal**: Optimize network requests and prevent API spam

**Checks**:
- HTTP cache headers for imagery/terrain endpoints
- Throttling/backoff on tile errors
- Spamming metadata endpoints
- Multiple `CreditDisplays`
- Duplicate Ion initializations
- Network calls in `requestAnimationFrame`
- Missing retry/backoff logic for failed tiles

**Usage**: `pnpm audit:network`

### 17. CPU Hotspots (`cpu.ts`)
**Goal**: Identify CPU-intensive operations for Web Worker offloading

**Checks**:
- Synchronous heavy math on main thread
- Nested loops in render callbacks
- Viewshed/sensor computations on main thread
- Geometry builders in render loop
- Large array operations without performance tracking
- Web Worker `postMessage` with large data (cloning overhead)
- Styling passes on large feature sets

**Usage**: `pnpm audit:cpu`

### 18. Image/Texture Pipeline (`textures.ts`)
**Goal**: Optimize texture loading and prevent memory waste

**Checks**:
- Full-res UI thumbnails bound as textures
- Base64 images bound as textures
- Missing max texture size enforcement
- `ImageMaterialProperty` recreated every render
- `TextureUniforms` recreated every render
- Missing texture reuse/caching
- Texture created in `useEffect` without cleanup

**Usage**: `pnpm audit:textures`

### 19. RSC Boundaries & Bundle (`rsc-boundaries.ts`)
**Goal**: Optimize Next.js bundle size and RSC boundaries

**Checks**:
- Client components that could be server components
- Large Cesium/ion SDK chunks leaking into non-Cesium routes
- Missing `dynamic(() => import(...), { ssr: false })` for viewer-only modules
- Dead code not tree-shaken (barrel imports)
- Missing fetch caching config (RSC)
- Accidental `no-store` killing ISR/edge caching
- Large components not code-split

**Usage**: `pnpm audit:rsc`

## Tier D — Domain-Specific Audits (Ad-hoc)

### 20. Cesium Lifecycle & Memory (`cesium-lifecycle.ts`)
**Goal**: Prevent Cesium memory leaks and resource cleanup issues

**Checks**:
- Duplicate Viewer instances
- Ghost entity references
- Primitive leaks during scene rebuilds
- Sensors left attached after unmount
- `viewer.scene.primitives.add()` without `.remove()`
- Event listeners not cleaned
- Camera event handlers not cleaned
- Ion SDK sensors not detached
- TilesRenderer without dispose()
- RequestAnimationFrame without cancelAnimationFrame

**Usage**: `pnpm audit:cesium`

### 21. State Management & Render Flow (`state-render.ts`)
**Goal**: Optimize React render performance and state management

**Checks**:
- Components subscribing to entire store objects (bad)
- Hooks that derive state in render path (bad)
- Missing shallow or structural memoization
- setState inside useEffect without guards
- Zustand selector patterns
- Re-render triggers
- Conditional hooks (React rules violation)
- Multiple store subscriptions in one component

**Usage**: `pnpm audit:state`

### 22. Mesh Loading & Asset Pipeline (`mesh-loading.ts`)
**Goal**: Optimize 3D model loading and prevent resource leaks

**Checks**:
- Duplicate loader creation
- Model scale normalization consistency
- Promise cancellation / disposal on route change
- LOD strategy existence
- Redundant network fetch cycles
- Fetch without AbortController
- Model loading without loading state

**Usage**: `pnpm audit:mesh`

### 23. Error Boundary & Failure Handling (`error-handling.ts`)
**Goal**: Prevent white screens and stuck loading states

**Checks**:
- Components that perform side-effects without fallback
- Missing try/catch around Cesium async APIs
- Upload workflows without onError UI recovery
- White screen risks
- Stuck loading states
- Ion SDK operations without error handling

**Usage**: `pnpm audit:errors`

### 24. Module Responsibility Boundaries (`module-boundaries.ts`)
**Goal**: Enforce clean separation of concerns

**Checks**:
- Files exceeding 300 lines
- UI components that also modify state (bad)
- Hooks that also do fetching (should split)
- Package boundaries are clean
- Mixed concerns in single file
- Store files that are too large

**Usage**: `pnpm audit:modules`

### 25. Form Field Accessibility (`form-fields.ts`)
**Goal**: Ensure form fields have proper id/name attributes for accessibility

**Checks**:
- Form input elements without id or name attributes
- TextField, Select, Input components without id or name props
- Native input, textarea, select elements without id or name attributes

**Usage**: `pnpm audit:forms`

### 26. Dependency Audit (`dependencies.ts`)
**Goal**: Ensure consistent dependency versions across monorepo

**Checks**:
- Version mismatches
- Unused dependencies
- Missing dependencies
- Build artifacts
- Configuration inconsistencies

**Usage**: `pnpm audit:dependencies`

### 27. Fetch Usage (`fetch-usage.ts`)
**Goal**: Enforce centralized API calls through api.ts

**Checks**:
- Direct fetch() calls outside of centralized api.ts
- fetch() calls in fetcher functions for SWR (should use centralized api.ts)
- Missing use of SWR for data fetching
- API routes using fetch (allowed - these are server-side)

**Usage**: `pnpm audit:fetch`

## Quick Commands

```bash
# Run all lightweight audits (Tier A)
pnpm audit:light

# Run all heavy audits (Tier B)
pnpm audit:heavy

# Run all performance audits (Tier C)
pnpm audit:performance

# Run everything (CI)
pnpm audit:ci

# Run individual performance audits
pnpm audit:renderloop  # Render loop optimization
pnpm audit:webgl      # WebGL resource lifecycle
pnpm audit:tiles      # 3D Tiles configuration
pnpm audit:viewer     # Viewer/Scene config
pnpm audit:hydration  # SSR/CSR boundaries
pnpm audit:lists      # List virtualization
pnpm audit:network    # Network & tiling optimization
pnpm audit:cpu        # CPU hotspot detection
pnpm audit:textures   # Image/texture pipeline
pnpm audit:rsc        # RSC boundaries & bundle size

# Run individual domain-specific audits
pnpm audit:cesium     # Cesium lifecycle & memory
pnpm audit:state      # State management & render flow
pnpm audit:mesh       # Mesh loading & asset pipeline
pnpm audit:errors     # Error boundary & failure handling
pnpm audit:modules    # Module responsibility boundaries
pnpm audit:forms      # Form field accessibility
pnpm audit:dependencies # Dependency version consistency
pnpm audit:fetch      # Fetch usage centralization
```

## Integration

### Local Development
Run `pnpm audit:light` before committing to catch issues early.

### CI/CD
Add to your GitHub Actions workflow:
```yaml
- name: Run audits
  run: pnpm audit:ci
```

### Vercel
Add to your Vercel build command (before the actual build):
```bash
pnpm audit:light && pnpm build:editor
```

## Customization

All thresholds are configurable at the top of each script file. Adjust as needed for your project's requirements.

