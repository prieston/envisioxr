🔍 Running Folder / Module Responsibility Boundaries Audit...

================================================================================
FOLDER / MODULE RESPONSIBILITY BOUNDARIES AUDIT REPORT
================================================================================

🔴 CRITICAL ISSUES: 11
--------------------------------------------------------------------------------

1. CRITICAL: File exceeds 500 lines
   File: apps/editor/app/components/Builder/properties/SDKObservationPropertiesPanel.tsx
   File has 609 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

2. CRITICAL: File exceeds 500 lines
   File: packages/core/src/state/useSceneStore.ts
   File has 779 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

3. CRITICAL: File exceeds 500 lines
   File: packages/engine-cesium/src/CesiumControls/controllers/FirstPersonWalkController.ts
   File has 639 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

4. CRITICAL: File exceeds 500 lines
   File: packages/engine-cesium/src/CesiumSDK.ts
   File has 891 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

5. CRITICAL: File exceeds 500 lines
   File: packages/engine-cesium/src/CesiumViewer.tsx
   File has 1007 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

6. CRITICAL: File exceeds 500 lines
   File: packages/engine-cesium/src/components/CesiumDateTimeSelector.tsx
   File has 576 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

7. CRITICAL: File exceeds 500 lines
   File: packages/engine-three/src/plugins/controls/SceneViewModeController.tsx
   File has 1181 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

8. CRITICAL: File exceeds 500 lines
   File: packages/ion-sdk/src/vendor/cesium-ion-sdk/ion-sdk-measurements/index.d.ts
   File has 1179 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

9. CRITICAL: File exceeds 500 lines
   File: packages/ion-sdk/src/vendor/cesium-ion-sdk/ion-sdk-sensors/index.d.ts
   File has 2103 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

10. CRITICAL: File exceeds 500 lines
   File: packages/ui/src/components/modals/tabs/MyLibraryTab.tsx
   File has 849 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

11. CRITICAL: File exceeds 500 lines
   File: packages/ui/src/components/modals/tabs/UploadToIonTab.tsx
   File has 933 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

🟡 HIGH PRIORITY ISSUES: 14
--------------------------------------------------------------------------------

1. HIGH: Hook combines fetching and state management
   File: apps/editor/app/components/AppBar/BuilderActions/hooks/useAssetManager.ts:1
   Hook does both data fetching and state management - should be split
   Fix: Split into separate hooks: useFetchData and useManageState

2. HIGH: Hook combines fetching and state management
   File: apps/editor/app/components/AppBar/BuilderActions/hooks/useCesiumIon.ts:2
   Hook does both data fetching and state management - should be split
   Fix: Split into separate hooks: useFetchData and useManageState

3. HIGH: File exceeds 300 lines
   File: apps/editor/app/components/Builder/assets/AssetLibraryPanel.tsx
   File has 429 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

4. HIGH: File exceeds 300 lines
   File: apps/editor/app/components/Report/ReportGenerator.tsx
   File has 492 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

5. HIGH: UI component does both rendering and data fetching
   File: apps/editor/app/components/Report/ReportGenerator.tsx:17
   Component mixes UI rendering with data fetching - violates separation of concerns
   Fix: Extract data fetching to custom hook or service

6. HIGH: Hook combines fetching and state management
   File: packages/core/src/state/useSceneStore.ts:248
   Hook does both data fetching and state management - should be split
   Fix: Split into separate hooks: useFetchData and useManageState

7. HIGH: Store file exceeds 500 lines
   File: packages/core/src/state/useSceneStore.ts
   Store has 779 lines - should be split into slices
   Fix: Split store into multiple slices using Zustand slices pattern

8. HIGH: File exceeds 300 lines
   File: packages/engine-cesium/src/CesiumControls/controllers/FlightController.ts
   File has 421 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

9. HIGH: File exceeds 300 lines
   File: packages/engine-cesium/src/CesiumControls/core/BaseCameraController.ts
   File has 406 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

10. HIGH: UI component does both rendering and data fetching
   File: packages/engine-cesium/src/components/CesiumBasemapSelector.tsx:14
   Component mixes UI rendering with data fetching - violates separation of concerns
   Fix: Extract data fetching to custom hook or service

11. HIGH: File exceeds 300 lines
   File: packages/engine-cesium/src/helpers/CesiumObjectTransformEditor.tsx
   File has 407 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

12. HIGH: Hook combines fetching and state management
   File: packages/engine-cesium/src/hooks/useCesiumIonUpload.ts:1
   Hook does both data fetching and state management - should be split
   Fix: Split into separate hooks: useFetchData and useManageState

13. HIGH: UI component does both rendering and data fetching
   File: packages/ui/src/components/LocationSearch/LocationSearch.tsx:38
   Component mixes UI rendering with data fetching - violates separation of concerns
   Fix: Extract data fetching to custom hook or service

14. HIGH: File exceeds 300 lines
   File: packages/ui/src/components/modals/tabs/UploadModelTab.tsx
   File has 484 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

🟢 MEDIUM PRIORITY ISSUES: 38
--------------------------------------------------------------------------------

1. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/AppBar/AdminAppBar.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

2. MEDIUM: File exceeds 300 lines
   File: apps/editor/app/components/AppBar/BuilderActions/hooks/useAssetManager.ts
   File has 308 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

3. MEDIUM: File mixes multiple concerns
   File: apps/editor/app/components/AppBar/BuilderActions/hooks/useAssetManager.ts
   File handles: state, fetching, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

4. MEDIUM: File exceeds 300 lines
   File: apps/editor/app/components/AppBar/BuilderActions/hooks/useCesiumIon.ts
   File has 308 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

5. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/Builder/ModelPositioningManager.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

6. MEDIUM: File mixes multiple concerns
   File: apps/editor/app/components/Builder/ModelPositioningManager.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

7. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/Builder/assets/AssetLibraryPanel.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

8. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/Builder/properties/PropertiesPanel/views/ObjectPropertiesView.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

9. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/Builder/properties/PropertiesPanel/views/ObservationPointView.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

10. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/Builder/properties/SDKObservationPropertiesPanel.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

11. MEDIUM: File exceeds 300 lines
   File: apps/editor/app/components/Builder/properties/TransformLocationSection.tsx
   File has 314 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

12. MEDIUM: Large UI component modifies state
   File: apps/editor/app/components/Builder/properties/TransformLocationSection.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

13. MEDIUM: File mixes multiple concerns
   File: apps/editor/app/components/Report/ReportGenerator.tsx
   File handles: rendering, state, fetching, utils - consider splitting
   Fix: Split into separate files by concern

14. MEDIUM: File exceeds 300 lines
   File: packages/engine-cesium/src/CesiumControls/controllers/CarController.ts
   File has 302 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

15. MEDIUM: File exceeds 300 lines
   File: packages/engine-cesium/src/CesiumControls/controllers/CarDriveController.ts
   File has 375 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

16. MEDIUM: File mixes multiple concerns
   File: packages/engine-cesium/src/CesiumViewer.tsx
   File handles: rendering, state, fetching, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

17. MEDIUM: File exceeds 300 lines
   File: packages/engine-cesium/src/components/CesiumDateTimeSelector.styles.ts
   File has 395 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

18. MEDIUM: Large UI component modifies state
   File: packages/engine-cesium/src/components/CesiumDateTimeSelector.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

19. MEDIUM: File mixes multiple concerns
   File: packages/engine-cesium/src/components/CesiumDateTimeSelector.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

20. MEDIUM: Large UI component modifies state
   File: packages/engine-cesium/src/helpers/CesiumFeatureSelector.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

21. MEDIUM: File mixes multiple concerns
   File: packages/engine-cesium/src/helpers/CesiumFeatureSelector.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

22. MEDIUM: Large UI component modifies state
   File: packages/engine-cesium/src/helpers/CesiumObjectTransformEditor.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

23. MEDIUM: File mixes multiple concerns
   File: packages/engine-cesium/src/helpers/CesiumObjectTransformEditor.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

24. MEDIUM: Large UI component modifies state
   File: packages/engine-three/src/components/CesiumIonTiles.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

25. MEDIUM: File mixes multiple concerns
   File: packages/engine-three/src/components/CesiumIonTiles.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

26. MEDIUM: File mixes multiple concerns
   File: packages/engine-three/src/plugins/controls/SceneViewModeController.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

27. MEDIUM: File exceeds 300 lines
   File: packages/ion-sdk/src/vendor/cesium-ion-sdk/ion-sdk-geometry/index.d.ts
   File has 379 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

28. MEDIUM: File exceeds 300 lines
   File: packages/ui/src/components/Dashboard/HelpPopup.tsx
   File has 399 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

29. MEDIUM: File mixes multiple concerns
   File: packages/ui/src/components/LocationSearch/LocationSearch.tsx
   File handles: rendering, state, fetching, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

30. MEDIUM: Large UI component modifies state
   File: packages/ui/src/components/lists/ObservationPointsList.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

31. MEDIUM: Large UI component modifies state
   File: packages/ui/src/components/modals/AssetManagerModal.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

32. MEDIUM: Large UI component modifies state
   File: packages/ui/src/components/modals/tabs/MyLibraryTab.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

33. MEDIUM: File mixes multiple concerns
   File: packages/ui/src/components/modals/tabs/MyLibraryTab.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

34. MEDIUM: Large UI component modifies state
   File: packages/ui/src/components/modals/tabs/UploadModelTab.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

35. MEDIUM: Large UI component modifies state
   File: packages/ui/src/components/modals/tabs/UploadToIonTab.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

36. MEDIUM: Large UI component modifies state
   File: packages/ui/src/components/table/MetadataTable.tsx
   Component handles UI and state management - consider splitting
   Fix: Move state management to hook or separate component

37. MEDIUM: File mixes multiple concerns
   File: packages/ui/src/components/table/MetadataTable.tsx
   File handles: rendering, state, sideEffects, utils - consider splitting
   Fix: Split into separate files by concern

38. MEDIUM: File exceeds 300 lines
   File: packages/ui/src/stories/Overview.stories.tsx
   File has 309 lines - should be split into smaller modules
   Fix: Split into smaller components/hooks (target: <300 lines)

================================================================================
SUMMARY
================================================================================
Critical: 11
High: 14
Medium: 38

❌ Audit failed - Critical boundary violations
