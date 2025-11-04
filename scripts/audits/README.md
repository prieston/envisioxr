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

## Quick Commands

```bash
# Run all lightweight audits (Tier A)
pnpm audit:light

# Run all heavy audits (Tier B)
pnpm audit:heavy

# Run everything (CI)
pnpm audit:ci
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

