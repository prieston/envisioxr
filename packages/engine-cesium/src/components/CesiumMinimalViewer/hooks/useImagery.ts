import { useEffect, useState } from "react";
import type { CesiumModule } from "../types";

interface UseImageryOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
  enableOpenStreetMap?: boolean;
}

interface UseImageryReturn {
  isLoaded: boolean;
  error: Error | null;
}

/**
 * Setup OpenStreetMap imagery for location editing
 */
async function setupOpenStreetMapImagery(viewer: any, Cesium: CesiumModule) {
  try {
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      credit: "© OpenStreetMap contributors",
      maximumLevel: 19,
    });

    viewer.imageryLayers.addImageryProvider(imageryProvider);
  } catch (err) {
    console.error("[useImagery] Failed to add OSM imagery:", err);
    throw err;
  }
}

/**
 * Hook to manage imagery setup (OpenStreetMap for location editing)
 */
export function useImagery({
  viewer,
  Cesium,
  enableOpenStreetMap = false,
}: UseImageryOptions): UseImageryReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!viewer || !Cesium || !enableOpenStreetMap) {
      setIsLoaded(false);
      return;
    }

    const setupImagery = async () => {
      try {
        await setupOpenStreetMapImagery(viewer, Cesium);
        setIsLoaded(true);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsLoaded(false);
      }
    };

    setupImagery();
  }, [viewer, Cesium, enableOpenStreetMap]);

  return {
    isLoaded,
    error,
  };
}

