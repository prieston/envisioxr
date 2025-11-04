🔍 Running State Management & Render Flow Audit...

================================================================================
STATE MANAGEMENT & RENDER FLOW AUDIT REPORT
================================================================================

🔴 CRITICAL ISSUES: 4
--------------------------------------------------------------------------------

1. CRITICAL: Hook called after conditional return
   File: packages/engine-cesium/src/CesiumViewer.tsx:4
   Hooks must be called unconditionally before any returns
   Fix: Move hook calls before conditional return or use early return after all hooks

2. CRITICAL: Hook called after conditional return
   File: packages/engine-cesium/src/helpers/CesiumFeatureSelector.tsx:1
   Hooks must be called unconditionally before any returns
   Fix: Move hook calls before conditional return or use early return after all hooks

3. CRITICAL: Hook called after conditional return
   File: packages/engine-three/src/plugins/controls/controls/FirstPersonControls.tsx:3
   Hooks must be called unconditionally before any returns
   Fix: Move hook calls before conditional return or use early return after all hooks

4. CRITICAL: Hook called after conditional return
   File: packages/engine-three/src/plugins/controls/controls/ThirdPersonFlightControls.tsx:3
   Hooks must be called unconditionally before any returns
   Fix: Move hook calls before conditional return or use early return after all hooks

🟡 HIGH PRIORITY ISSUES: 5
--------------------------------------------------------------------------------

1. HIGH: setState in useEffect without guard
   File: apps/editor/app/components/Builder/properties/ModelInformationSection.tsx:20
   Can cause infinite loops or unnecessary re-renders
   Fix: Add guard: if (!condition) return; before setState

2. HIGH: setState in useEffect without guard
   File: packages/engine-three/src/plugins/controls/controls/SceneControls.tsx:29
   Can cause infinite loops or unnecessary re-renders
   Fix: Add guard: if (!condition) return; before setState

3. HIGH: setState in useEffect without guard
   File: packages/engine-three/src/plugins/controls/controls/SceneControls.tsx:34
   Can cause infinite loops or unnecessary re-renders
   Fix: Add guard: if (!condition) return; before setState

4. HIGH: setState in useEffect without guard
   File: packages/ui/src/components/LocationSearch/LocationSearch.tsx:128
   Can cause infinite loops or unnecessary re-renders
   Fix: Add guard: if (!condition) return; before setState

5. HIGH: setState in useEffect without guard
   File: packages/ui/src/components/table/MetadataTable.tsx:62
   Can cause infinite loops or unnecessary re-renders
   Fix: Add guard: if (!condition) return; before setState

🟢 MEDIUM PRIORITY ISSUES: 38
--------------------------------------------------------------------------------

1. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/AppBar/AdminAppBar.tsx:6
   Component has 7 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

2. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/AdminLayout.tsx:17
   Component has 4 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

3. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/ModelPositioningManager.tsx:4
   Component has 8 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

4. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/Scene/PlaybackManager.tsx:4
   Component has 4 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

5. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/Scene/SceneCanvas.tsx:5
   Component has 4 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

6. MEDIUM: Expensive operation in render without memoization
   File: apps/editor/app/components/Builder/assets/ModelMetadataFields.tsx:65
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

7. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/lists/SceneObjectsListWrapper.tsx:3
   Component has 7 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

8. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/panels/BottomPanel/BottomPanel.tsx:4
   Component has 19 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

9. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/panels/LeftPanel/LeftPanel.tsx:5
   Component has 12 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

10. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/panels/RightPanel/RightPanel.tsx:5
   Component has 13 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

11. MEDIUM: Expensive operation in render without memoization
   File: apps/editor/app/components/Builder/properties/CesiumFeaturePropertyCategory.tsx:106
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

12. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/properties/PropertiesPanel/hooks/usePropertyChange.ts:2
   Component has 5 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

13. MEDIUM: Expensive operation in render without memoization
   File: apps/editor/app/components/Builder/properties/PropertiesPanel/views/CesiumFeatureView.tsx:76
   Found Object\.keys in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

14. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/properties/PropertiesPanel/views/ObjectPropertiesView.tsx:3
   Component has 13 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

15. MEDIUM: Too many store subscriptions
   File: apps/editor/app/components/Builder/properties/PropertiesPanel/views/ObservationPointView.tsx:4
   Component has 7 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

16. MEDIUM: Too many store subscriptions
   File: packages/core/src/state/index.ts:2
   Component has 4 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

17. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/CesiumViewer.tsx:4
   Component has 11 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

18. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/components/CesiumDateTimeSelector.tsx:36
   Component has 9 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

19. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/components/CesiumIonAssetsManager.tsx:14
   Component has 6 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

20. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/components/CesiumLocationSearchSection.tsx:5
   Component has 4 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

21. MEDIUM: Expensive operation in render without memoization
   File: packages/engine-cesium/src/components/CesiumSimulationInstructions.tsx:70
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

22. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/helpers/CesiumCameraCaptureHandler.tsx:5
   Component has 6 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

23. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/helpers/CesiumCameraSpringController.tsx:5
   Component has 7 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

24. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/helpers/CesiumFeatureSelector.tsx:2
   Component has 7 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

25. MEDIUM: Too many store subscriptions
   File: packages/engine-cesium/src/helpers/CesiumObjectTransformEditor.tsx:19
   Component has 5 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

26. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/Scene.tsx:6
   Component has 18 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

27. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/components/Model.tsx:5
   Component has 4 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

28. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/components/Scene/CameraPOVCaptureHandler.tsx:5
   Component has 9 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

29. MEDIUM: Expensive operation in render without memoization
   File: packages/engine-three/src/components/Scene/SceneObjects.tsx:18
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

30. MEDIUM: Expensive operation in render without memoization
   File: packages/engine-three/src/components/Scene/SceneObservationPoints.tsx:23
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

31. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/components/ThreeJSLocationSearchSection.tsx:4
   Component has 8 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

32. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/plugins/controls/SceneViewModeController.tsx:5
   Component has 9 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

33. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/plugins/controls/controls/SceneControls.tsx:7
   Component has 6 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

34. MEDIUM: Too many store subscriptions
   File: packages/engine-three/src/plugins/spring/CameraSpringController.tsx:6
   Component has 7 store subscriptions - consider combining
   Fix: Combine multiple selectors into single subscription or split component

35. MEDIUM: Expensive operation in render without memoization
   File: packages/ui/src/components/Dashboard/HelpPopup.tsx:212
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

36. MEDIUM: Expensive operation in render without memoization
   File: packages/ui/src/components/Environment/BasemapSelector.tsx:83
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

37. MEDIUM: Expensive operation in render without memoization
   File: packages/ui/src/components/lists/ObservationPointsList.tsx:107
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

38. MEDIUM: Expensive operation in render without memoization
   File: packages/ui/src/components/lists/SceneObjectsList.tsx:71
   Found \.map\( in render body - consider useMemo
   Fix: Wrap expensive computation in useMemo

================================================================================
SUMMARY
================================================================================
Critical: 4
High: 5
Medium: 38

❌ Audit failed - Critical issues must be fixed
