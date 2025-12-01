import { useEffect, useState } from "react";
import { waitForSceneReady } from "../../../utils/viewer-config";
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
 * Note: Assumes scene is already ready (caller should wait for scene readiness)
 */
async function setupTerrainProvider(viewer: any, Cesium: CesiumModule) {
  // Check if viewer is valid and not destroyed
  if (!viewer) {
    throw new Error("Viewer not available");
  }

  if (viewer.isDestroyed && viewer.isDestroyed()) {
    throw new Error("Viewer has been destroyed");
  }

  // Double-check scene exists before accessing it
  if (!viewer.scene || !viewer.scene.globe) {
    throw new Error("Viewer scene or globe not available");
  }

  try {
    // Create terrain provider first
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(
      1,
      {
        requestVertexNormals: true,
        requestWaterMask: true,
      }
    );

    // Double-check viewer is still valid before setting terrain provider
    if (!viewer || (viewer.isDestroyed && viewer.isDestroyed()) || !viewer.scene) {
      throw new Error("Viewer or scene became unavailable during terrain setup");
    }

    // Set terrain provider - this may trigger Cesium's internal setter
    // which accesses viewer.scene, so we need to ensure scene is ready
    viewer.terrainProvider = terrainProvider;

    // Double-check scene is still valid before accessing globe
    if (!viewer.scene || !viewer.scene.globe) {
      throw new Error("Scene or globe not available after setting terrain");
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
      setError(null);
      return;
    }

    let cancelled = false;

    const setupTerrain = async () => {
      try {
    // Check if viewer is destroyed
    if (viewer.isDestroyed && viewer.isDestroyed()) {
          if (!cancelled) {
      setIsReady(false);
            setError(new Error("Viewer has been destroyed"));
          }
      return;
    }

        // Wait for scene to be ready (with timeout)
        try {
          await waitForSceneReady(viewer, 20, 50); // Wait up to 1 second (20 * 50ms)
        } catch (waitErr) {
          if (!cancelled) {
      setIsReady(false);
            setError(waitErr instanceof Error ? waitErr : new Error(String(waitErr)));
          }
      return;
    }

        // Double-check viewer is still valid before setup
        if (cancelled || !viewer || (viewer.isDestroyed && viewer.isDestroyed()) || !viewer.scene) {
          return;
        }

        await setupTerrainProvider(viewer, Cesium);

        if (!cancelled) {
        setIsReady(true);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsReady(false);
          // Continue without terrain if it fails - this is non-critical
        }
      }
    };

    setupTerrain();

    return () => {
      cancelled = true;
    };
  }, [viewer, Cesium, enabled]);

  return {
    isReady,
    error,
  };
}


