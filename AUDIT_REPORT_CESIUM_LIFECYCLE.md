🔍 Running Cesium Lifecycle & Memory Audit...

================================================================================
CESIUM LIFECYCLE & MEMORY AUDIT REPORT
================================================================================

🔴 CRITICAL ISSUES: 2
--------------------------------------------------------------------------------

1. CRITICAL: entities.add() without matching remove()
   File: packages/engine-cesium/src/CesiumViewer.tsx:624
   Found 3 add() but only 2 remove() - memory leak
   Fix: Ensure every entity.add() has cleanup in useEffect or componentWillUnmount

2. CRITICAL: primitives.add() without matching remove()
   File: packages/engine-cesium/src/components/CesiumBasemapSelector.tsx:129
   Found 1 add() calls but only 0 remove() calls - memory leak risk
   Fix: Ensure every add() has a corresponding remove() in cleanup

🟢 MEDIUM PRIORITY ISSUES: 5
--------------------------------------------------------------------------------

1. MEDIUM: requestAnimationFrame without cancelAnimationFrame
   File: packages/engine-cesium/src/CesiumControls/core/CameraControllerManager.ts:171
   Found 2 RAF calls but only 1 cancel calls
   Fix: Store RAF ID and cancel in cleanup: cancelAnimationFrame(rafId)

2. MEDIUM: requestAnimationFrame without cancelAnimationFrame
   File: packages/engine-cesium/src/CesiumControls/hooks/useSimulation.ts:137
   Found 2 RAF calls but only 1 cancel calls
   Fix: Store RAF ID and cancel in cleanup: cancelAnimationFrame(rafId)

3. MEDIUM: requestAnimationFrame without cancelAnimationFrame
   File: packages/engine-cesium/src/helpers/CesiumObjectTransformEditor.tsx:234
   Found 3 RAF calls but only 1 cancel calls
   Fix: Store RAF ID and cancel in cleanup: cancelAnimationFrame(rafId)

4. MEDIUM: requestAnimationFrame without cancelAnimationFrame
   File: packages/engine-cesium/src/helpers/CesiumPerformanceOptimizer.tsx:113
   Found 2 RAF calls but only 1 cancel calls
   Fix: Store RAF ID and cancel in cleanup: cancelAnimationFrame(rafId)

5. MEDIUM: requestAnimationFrame without cancelAnimationFrame
   File: apps/editor/app/components/Builder/properties/SDKObservationPropertiesPanel.tsx:30
   Found 1 RAF calls but only 0 cancel calls
   Fix: Store RAF ID and cancel in cleanup: cancelAnimationFrame(rafId)

================================================================================
SUMMARY
================================================================================
Critical: 2
High: 0
Medium: 5

❌ Audit failed - Critical memory leaks detected
