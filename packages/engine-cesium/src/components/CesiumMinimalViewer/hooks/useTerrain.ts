import { useEffect, useState } from "react";
import type { CesiumModule } from "../types";

interface UseTerrainOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
  enabled: boolean;
}

interface UseTerrainReturn {
  isReady: boolean;
  error: Error | null;
}

/**
 * Setup Cesium World Terrain for accurate height picking
 */
async function setupTerrainProvider(viewer: any, Cesium: CesiumModule) {
  try {
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(
      1,
      {
        requestVertexNormals: true,
        requestWaterMask: true,
      }
    );

    // Enable depth testing against terrain
    viewer.scene.globe.depthTestAgainstTerrain = true;
  } catch (err) {
    console.error("[useTerrain] Failed to add terrain:", err);
    throw err;
  }
}

/**
 * Hook to manage terrain setup
 */
export function useTerrain({
  viewer,
  Cesium,
  enabled,
}: UseTerrainOptions): UseTerrainReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!viewer || !Cesium || !enabled) {
      setIsReady(false);
      return;
    }

    const setupTerrain = async () => {
      try {
        await setupTerrainProvider(viewer, Cesium);
        setIsReady(true);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsReady(false);
        // Continue without terrain if it fails
      }
    };

    setupTerrain();
  }, [viewer, Cesium, enabled]);

  return {
    isReady,
    error,
  };
}

