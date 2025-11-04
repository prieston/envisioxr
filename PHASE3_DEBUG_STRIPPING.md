# Phase 3: Debug Stripping - Implementation Status

## ✅ Completed

### 1. Centralized Logger (`@envisio/core/utils/logger`)
- ✅ Created logger with compile-time flag support
- ✅ Supports `__DEV__`, `__LOG_LEVEL__`, `DEBUG_SENSORS` constants
- ✅ Dead-code elimination for production builds
- ✅ Sensor-specific logging via `logger.sensors()` when `DEBUG_SENSORS` is true

### 2. Compile-Time Constants
- ✅ Added `DefinePlugin` to `apps/editor/next.config.mjs`
- ✅ Added `DefinePlugin` to `apps/website/next.config.mjs`
- ✅ Constants defined: `__DEV__`, `__LOG_LEVEL__`, `DEBUG_SENSORS`
- ✅ TypeScript declarations with `@ts-ignore` for compile-time constants

### 3. Logger Migration
- ✅ Replaced `packages/engine-cesium/src/utils/logger.ts` → re-exports from `@envisio/core`
- ✅ Replaced `apps/editor/app/utils/logger.ts` → re-exports from `@envisio/core`
- ✅ Replaced `apps/editor/app/components/AppBar/logger.ts` → re-exports from `@envisio/core`
- ✅ Updated `packages/ion-sdk/src/utils/sensors/creators.ts` to use logger
- ✅ Updated `packages/ion-sdk/src/utils/sensors/constants.ts` to use `DEBUG_SENSORS`
- ✅ Updated `apps/editor/app/api/ion-upload/route.ts` to use logger
- ✅ Updated `packages/engine-cesium/src/CesiumViewer.tsx` to use `__DEV__` flag

### 4. ESLint Rules
- ✅ Added `no-console: error` rule (forbids all console calls)
- ✅ Override for logger files (`**/utils/logger.ts`, `**/logger.ts`)
- ✅ Override for test files (`**/*.test.ts`, `**/*.spec.ts`)
- ✅ Override for scripts and configs (`**/scripts/**`, `**/*.config.*`)

## 🔄 In Progress

### Console Call Replacement
- ⚠️ ~50+ files still contain console.* calls
- Most are in:
  - API routes (server-side, need logger but allow console.error for critical errors)
  - Component files
  - Utility functions
  - Hook files

## 📋 Remaining Work

### High Priority
1. Replace console calls in:
   - `packages/engine-cesium/src/CesiumControls/**/*.ts`
   - `packages/ion-sdk/src/**/*.ts`
   - `apps/editor/app/components/**/*.tsx`
   - `apps/editor/app/hooks/**/*.ts`
   - `apps/editor/app/api/**/*.ts` (server-side)

### Verification Steps
1. ✅ Packages build successfully
2. ⏳ Verify production builds have zero console calls
3. ⏳ Verify size budgets don't grow
4. ⏳ Verify Playwright tests still pass
5. ⏳ Run bundle analyzer to confirm dead-code elimination

## 🎯 Acceptance Criteria

- [x] Centralized logger created
- [x] Compile-time flags added
- [x] ESLint rules configured
- [ ] All console.* calls replaced (except in logger.ts and tests)
- [ ] Production bundles contain zero console calls
- [ ] Size budgets unchanged
- [ ] Playwright tests pass

## 📝 Notes

- Server-side code (API routes) uses logger but may need `console.error` for critical errors
- TypeScript declarations use `@ts-ignore` because constants are defined at compile time
- `DEBUG_SENSORS` constant gates verbose Cesium sensor logging
- Logger falls back to `NODE_ENV` check if compile-time constants aren't defined

---

**Status**: 🟡 Infrastructure Complete, Migration In Progress
**Next**: Complete console call replacement, then verify production builds


