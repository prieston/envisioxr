/**
 * Hook for managing basemap changes
 */

import { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core";
import { applyBasemapType } from "../utils/basemap";

export function useCesiumBasemap(viewer: any, cesium: any, isLoading: boolean) {
  const basemapType = useSceneStore((s) => s.basemapType);
  const viewerRef = useRef(viewer);
  const cesiumRef = useRef(cesium);
  const lastBasemapTypeRef = useRef<string | null>(null);
  const hasAppliedBasemapRef = useRef(false);

  // Update refs when viewer/cesium change, but don't trigger basemap reapplication
  useEffect(() => {
    viewerRef.current = viewer;
    cesiumRef.current = cesium;
  }, [viewer, cesium]);

  useEffect(() => {
    // Only apply basemap when basemapType actually changes, not when viewer/cesium refs change
    if (!viewerRef.current || !cesiumRef.current || isLoading) return;

    // Skip if basemapType hasn't changed (but allow initial application when viewer becomes ready)
    const isInitialApplication = !hasAppliedBasemapRef.current;
    if (!isInitialApplication && lastBasemapTypeRef.current === basemapType)
      return;

    // Apply basemap change when basemapType changes or on initial load
    if (basemapType) {
      lastBasemapTypeRef.current = basemapType;
      hasAppliedBasemapRef.current = true;
      applyBasemapType(viewerRef.current, cesiumRef.current, basemapType);
    }
  }, [basemapType, isLoading]);
}
