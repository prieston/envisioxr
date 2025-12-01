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
  // Check if viewer is valid and not destroyed
  if (!viewer) {
    throw new Error("Viewer not available");
  }

  if (viewer.isDestroyed && viewer.isDestroyed()) {
    throw new Error("Viewer has been destroyed");
  }

  // Check if scene exists before accessing it
  if (!viewer.scene) {
    throw new Error("Viewer scene not available");
  }

  try {
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(
      1,
      {
        requestVertexNormals: true,
        requestWaterMask: true,
      }
    );

    // Double-check scene is still valid before accessing globe
    if (!viewer.scene || !viewer.scene.globe) {
      throw new Error("Scene or globe not available");
    }

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

    // Check if viewer is destroyed
    if (viewer.isDestroyed && viewer.isDestroyed()) {
      setIsReady(false);
      return;
    }

    // Check if scene is available
    if (!viewer.scene) {
      setIsReady(false);
      return;
    }

    const setupTerrain = async () => {
      try {
        // Double-check viewer is still valid before setup
        if (!viewer || (viewer.isDestroyed && viewer.isDestroyed()) || !viewer.scene) {
          return;
        }
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


