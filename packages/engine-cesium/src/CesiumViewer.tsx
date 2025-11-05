"use client";

import { useRef } from "react";
import {
  useCesiumInitialization,
  useCesiumEntities,
  useCesiumStyling,
  useCesiumBasemap,
} from "./hooks/index";
import {
  CesiumLoadingScreen,
  CesiumErrorDisplay,
  CesiumViewerContent,
} from "./components/index";

/**
 * Main Cesium Viewer Component
 *
 * This component orchestrates the Cesium viewer initialization and lifecycle.
 * It uses custom hooks to separate concerns:
 * - useCesiumInitialization: Handles viewer setup and initialization
 * - useCesiumEntities: Manages entity rendering and updates
 * - useCesiumStyling: Handles viewer styling and resize
 * - useCesiumBasemap: Manages basemap changes
 */
export default function CesiumViewer() {
  // Instance tracking for debugging
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  // Initialize Cesium viewer and get viewer state
  const { viewer, cesium, isLoading, error, containerRef } =
    useCesiumInitialization();

  // Render entities whenever world data or scene objects change
  useCesiumEntities(viewer, cesium, isLoading);

  // Handle viewer styling and resize
  useCesiumStyling(viewer, containerRef, isLoading);

  // Handle basemap changes from the store
  useCesiumBasemap(viewer, cesium, isLoading);

  // Render error state
  if (error) {
    return <CesiumErrorDisplay error={error} instanceId={instanceId.current} />;
  }

  // Render viewer
  return (
    <>
      {isLoading && <CesiumLoadingScreen />}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          minWidth: "100%",
          minHeight: "100%",
        }}
        ref={containerRef}
      />
      {viewer && <CesiumViewerContent viewer={viewer} />}
    </>
  );
}
