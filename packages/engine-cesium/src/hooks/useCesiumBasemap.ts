/**
 * Hook for managing basemap changes
 */

import { useEffect } from "react";
import { useSceneStore } from "@envisio/core";
import { applyBasemapType } from "../utils/basemap";

export function useCesiumBasemap(
  viewer: any,
  cesium: any,
  isLoading: boolean
) {
  const basemapType = useSceneStore((s) => s.basemapType);

  useEffect(() => {
    if (!viewer || !cesium || isLoading) return;

    // Apply basemap change when basemapType changes
    if (basemapType) {
      applyBasemapType(viewer, cesium, basemapType);
    }
  }, [basemapType, isLoading, viewer, cesium]);
}

