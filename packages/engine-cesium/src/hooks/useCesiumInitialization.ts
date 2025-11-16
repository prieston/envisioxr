/**
 * Hook for initializing and managing Cesium viewer lifecycle
 */

import { useEffect, useRef, useState } from "react";
import { useSceneStore } from "@envisio/core";
import {
  ensureCesiumBaseUrl,
  setupCesiumIonToken,
  createViewerOptions,
  configureSceneDefaults,
  configureSkybox,
  configureLighting,
  configureShadows,
  setViewerTime,
  setViewerResolutionScale,
} from "../utils";
import { applyBasemapType } from "../utils/basemap";
import { canSupportViewshed } from "../utils/viewshed-capability";

// IoT service is an editor concern; stub locally for engine usage
const iotService = {
  initialize: () => {},
  stopAll: () => {},
};

export interface UseCesiumInitializationResult {
  viewer: any;
  cesium: any;
  isLoading: boolean;
  error: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useCesiumInitialization(): UseCesiumInitializationResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializing = useRef(false);

  const setCesiumViewer = useSceneStore((state) => state.setCesiumViewer);
  const setCesiumInstance = useSceneStore((state) => state.setCesiumInstance);
  const basemapType = useSceneStore((state) => state.basemapType);

  // React Strict Mode compatible cleanup
  const cleanupPrimitives = () => {
    if (viewerRef.current && cesiumRef.current) {
      try {
        viewerRef.current.entities.removeAll();
        viewerRef.current.scene.primitives.removeAll();
      } catch (error) {
        // Error during cleanup
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current || viewerRef.current || isInitializing.current) {
      return;
    }

    isInitializing.current = true;

    const initializeCesium = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure Ion SDK is loaded before creating viewer
        const { ensureIonSDKLoaded } = await import("@envisio/ion-sdk");
        await ensureIonSDKLoaded();

        // Dynamic import of Cesium with error handling
        let Cesium;
        try {
          Cesium = await import("cesium");
          cesiumRef.current = Cesium;
          setCesiumInstance(Cesium);

          // Make Cesium available globally for Ion SDK
          (window as typeof window & { Cesium: typeof Cesium }).Cesium =
            Cesium;
        } catch (importError) {
          throw new Error("Failed to load Cesium library");
        }

        // Verify CESIUM_BASE_URL is set
        ensureCesiumBaseUrl();

        // Set Cesium Ion access token
        setupCesiumIonToken(Cesium);

        const { Viewer } = Cesium;

        // Ensure container has proper dimensions before Cesium initialization
        if (containerRef.current) {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();

          if (rect.width > 0 && rect.height > 0) {
            container.style.width = `${rect.width}px`;
            container.style.height = `${rect.height}px`;
          } else {
            container.style.width = "100%";
            container.style.height = "100%";
          }
        }

        // Create viewer with mobile-optimized configuration
        if (!containerRef.current)
          throw new Error("Missing container element");
        viewerRef.current = new Viewer(
          containerRef.current,
          createViewerOptions()
        );

        // Store viewer reference in the store
        setCesiumViewer(viewerRef.current);

        // Expose viewer on window for smoke tests and debugging
        if (typeof window !== "undefined") {
          (window as any).cesiumViewer = viewerRef.current;
        }

        // Configure scene defaults
        const scene = viewerRef.current.scene as any;
        configureSceneDefaults(scene, Cesium);

        // Set resolution scale
        setViewerResolutionScale(viewerRef.current);

        // Set initial skybox configuration based on store state
        const { skyboxType } = useSceneStore.getState();
        configureSkybox(viewerRef.current, skyboxType);

        // Apply saved basemap type if it's not the default
        // Note: Tileset cleanup is handled by useCesiumBasemap hook
        if (basemapType && basemapType !== "cesium") {
          await applyBasemapType(viewerRef.current, Cesium, basemapType);
        }

        // Set terrain provider after viewer creation with error handling
        // On mobile devices, disable memory-intensive features to prevent crashes
        const isMobile = typeof window !== "undefined" && (
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          (window.innerWidth <= 768 && window.matchMedia("(max-width: 768px)").matches)
        );

        try {
          const terrainProvider = await Cesium.createWorldTerrainAsync({
            // Disable memory-intensive features on mobile devices
            requestWaterMask: !isMobile,
            requestVertexNormals: !isMobile,
          });
          viewerRef.current.terrainProvider = terrainProvider;
        } catch (terrainError) {
          // Failed to load world terrain - not critical
          console.warn("Failed to load terrain provider:", terrainError);
        }

        // Check viewshed capability for debugging
        canSupportViewshed(viewerRef.current);

        // Apply saved time simulation settings from store
        const {
          cesiumLightingEnabled,
          cesiumShadowsEnabled,
          cesiumCurrentTime,
        } = useSceneStore.getState();

        // Apply lighting settings
        configureLighting(viewerRef.current, cesiumLightingEnabled);

        // Apply shadow settings
        configureShadows(viewerRef.current, cesiumShadowsEnabled);

        // Apply saved time if available
        if (cesiumCurrentTime) {
          setViewerTime(viewerRef.current, Cesium, cesiumCurrentTime);
        }

        // Set up error handling for the viewer
        viewerRef.current.scene.debugShowFramesPerSecond = false;

        // Apply custom styling to ensure full size and hide credits
        const viewerElement = viewerRef.current.cesiumWidget.container;
        if (viewerElement) {
          viewerElement.style.width = "100%";
          viewerElement.style.height = "100%";

          // Hide credit elements
          const creditElements = viewerElement.querySelectorAll(
            ".cesium-viewer-bottom, .cesium-credit-text, .cesium-credit-logoContainer, .cesium-credit-expand-link"
          );
          creditElements.forEach((element: Element) => {
            (element as HTMLElement).style.display = "none";
          });

          // Ensure canvas takes full size
          const canvas = viewerElement.querySelector("canvas");
          if (canvas) {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.right = "0";
            canvas.style.bottom = "0";
          }
        }

        setIsLoading(false);

        // Initialize IoT service for auto-refresh functionality
        iotService.initialize();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize Cesium"
        );
        setIsLoading(false);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeCesium();

    return () => {
      cleanupPrimitives();
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (cleanupError) {
          // Error during cleanup
        }
      }
      iotService.stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Zustand setters (setCesiumInstance, setCesiumViewer) are stable and don't need to be in dependency array
  }, []);

  return {
    viewer: viewerRef.current,
    cesium: cesiumRef.current,
    isLoading,
    error,
    containerRef,
  };
}

