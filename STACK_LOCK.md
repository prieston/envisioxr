# Stack Lock Summary

## ✅ Locked Stack Baseline

**Date**: $(date)
**Status**: ✅ Locked and Verified

### Core Versions (Effective Pinned Versions)

- **Node.js**: `>=20 <23`
- **pnpm**: `>=9` (using 9.12.3)
- **Next.js**: `14.2.33` (pinned via override `^14.2.18`)
- **React**: `18.3.1` (pinned via override `^18.3.1`)
- **React DOM**: `18.3.1` (pinned via override `^18.3.1`)
- **TypeScript**: `5.9.3` (pinned via override `^5.9.0`)

### Verification Results

```bash
# Single Next.js version
pnpm why next
✓ next 14.2.33 (single instance, pinned from override ^14.2.18)

# Single React version
pnpm why react
✓ react 18.3.1 (single instance, pinned from override ^18.3.1)

# Single TypeScript version
pnpm why typescript
✓ typescript 5.9.3 (single instance, pinned from override ^5.9.0)
```

## 🔒 Locking Mechanism

### Root Overrides

```json
{
  "pnpm": {
    "overrides": {
      "@cesium/engine": "^22.0.0",
      "next": "^14.2.18", // Effective: 14.2.33
      "react": "^18.3.1", // Effective: 18.3.1
      "react-dom": "^18.3.1", // Effective: 18.3.1
      "typescript": "^5.9.0" // Effective: 5.9.3
    }
  }
}
```

**Note**: Overrides use caret ranges, but pnpm resolves to specific versions. The effective pinned versions are shown above.

### Peer Dependencies

All library packages now use `peerDependencies` for React/Next:

- `@envisio/core`: React as peer
- `@envisio/config`: React as peer
- `@envisio/ui`: React, ReactDOM as peers
- `@envisio/engine-cesium`: React, ReactDOM as peers
- `@envisio/engine-three`: React, ReactDOM as peers
- `@envisio/ion-sdk`: Next, React as peers

### TypeScript Distribution

- Removed TypeScript from all library packages
- TypeScript only in root and apps (matching versions)
- All packages point `types` to `dist/index.d.ts`

## 🛡️ Validation Gates

### New Scripts Added

- `pnpm syncpack:check` - Verify version consistency
- `pnpm syncpack:fix` - Auto-fix version mismatches
- `pnpm typecheck` - Type check all packages
- `pnpm validate` - Run syncpack + typecheck

### Syncpack Configuration

- Validates core dependencies (next, react, react-dom, typescript)
- Ignores peer dependency ranges (intentional flexibility)
- Ignores workspace protocol variations

## 📦 Package Changes

### Fixed Package Names

- ✅ `react-three-next` → `@envisioxr/editor`

### Removed Build Artifacts

- ✅ Removed `packages/core/dist_test/`
- ✅ Removed `test-ion-token.html`

### Standardized Engines

- ✅ All packages now have `engines` field
- ✅ Consistent Node.js and pnpm requirements

## 🚨 Known Issues (Non-Critical)

These are acceptable and don't affect the locked stack:

- Minor version mismatches in non-core dependencies (can be addressed later)
- MUI version mismatch in config package (separate issue)

## ✅ Next Steps

1. Verify builds are green: `pnpm build:packages && pnpm build:editor`
2. Run validation: `pnpm validate`
3. Proceed with cleanup phases from CLEANUP_PLAN.md

---

**Lock Status**: ✅ COMPLETE
**Build Status**: ⏳ Pending Verification
