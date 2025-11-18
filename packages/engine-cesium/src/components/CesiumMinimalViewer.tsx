"use client";

import { useRef, useEffect } from "react";
import { ensureCesiumBaseUrl } from "../utils/cesium-config";

interface CesiumMinimalViewerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cesiumAssetId: string;
  cesiumApiKey: string;
  onViewerReady?: (viewer: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Minimal Cesium viewer component for preview/thumbnail capture
 * Creates a viewer without globe, basemap, or UI controls
 */
export function CesiumMinimalViewer({
  containerRef,
  cesiumAssetId,
  cesiumApiKey,
  onViewerReady,
  onError,
}: CesiumMinimalViewerProps) {
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);
  const isInitializing = useRef(false);
  const tilesetRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if container exists and if viewer is already initialized
    if (!containerRef.current || viewerRef.current || isInitializing.current) {
      return;
    }

    // Check if container already has a Cesium viewer or canvas (prevent duplicates)
    if (
      containerRef.current.querySelector(".cesium-viewer") ||
      containerRef.current.querySelector("canvas")
    ) {
      return;
    }

    isInitializing.current = true;

    const initializeCesium = async () => {
      try {

        // Ensure Ion SDK is loaded before creating viewer
        const { ensureIonSDKLoaded } = await import("@envisio/ion-sdk");
        await ensureIonSDKLoaded();

        // Dynamic import of Cesium
        const Cesium = await import("cesium");
        cesiumRef.current = Cesium;

        // Make Cesium available globally for Ion SDK
        (window as typeof window & { Cesium: typeof Cesium }).Cesium = Cesium;

        // Verify CESIUM_BASE_URL is set
        ensureCesiumBaseUrl();

        // Set custom API key (not the default one)
        Cesium.Ion.defaultAccessToken = cesiumApiKey;

        const { Viewer } = Cesium;

        // Ensure container has proper dimensions before creating viewer
        if (!containerRef.current) {
          throw new Error("Missing container element");
        }

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        // Wait for container to have dimensions if needed
        if (rect.width === 0 || rect.height === 0) {
          // Wait a frame for styles to apply
          await new Promise<void>((resolve) => {
            const rafId = requestAnimationFrame(() => {
              rafIdRef.current = null;
              resolve();
            });
            rafIdRef.current = rafId;
          });
          const newRect = container.getBoundingClientRect();
          if (newRect.width === 0 || newRect.height === 0) {
            // Still no dimensions, use defaults
            container.style.width = "100%";
            container.style.height = "100%";
          } else {
            container.style.width = `${newRect.width}px`;
            container.style.height = `${newRect.height}px`;
          }
        } else {
          // Set explicit dimensions
          container.style.width = `${rect.width}px`;
          container.style.height = `${rect.height}px`;
        }

        // Double-check no viewer was created during async operations
        if (containerRef.current.querySelector(".cesium-viewer")) {
          isInitializing.current = false;
          return;
        }

        viewerRef.current = new Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          homeButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          // Disable globe + imagery
          skyBox: false,
          skyAtmosphere: false,
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          // Remove credits and attribution
          creditContainer: undefined,
          creditViewport: undefined,
        });

        // Hide the globe entirely
        viewerRef.current.scene.globe.show = false;

        // Black background
        viewerRef.current.scene.backgroundColor = Cesium.Color.BLACK;

        // Force viewer to resize to container dimensions
        if (viewerRef.current.cesiumWidget) {
          // Ensure viewer and widget containers fill the parent
          const viewerElement = viewerRef.current.cesiumWidget.container;
          if (viewerElement) {
            viewerElement.style.width = "100%";
            viewerElement.style.height = "100%";
          }
          const widgetContainer = viewerRef.current.cesiumWidget.container?.parentElement;
          if (widgetContainer) {
            widgetContainer.style.width = "100%";
            widgetContainer.style.height = "100%";
          }
          // Force resize
          viewerRef.current.cesiumWidget.resize();
          // Also resize after a short delay to ensure dimensions are applied
          setTimeout(() => {
            if (viewerRef.current?.cesiumWidget) {
              viewerRef.current.cesiumWidget.resize();
            }
          }, 100);
        }

        // Hide all credit/attribution elements
        const hideCredits = () => {
          // Hide credits in the viewer container
          const viewerContainer = containerRef.current;
          if (viewerContainer) {
            const creditElements = viewerContainer.querySelectorAll(
              ".cesium-viewer-bottom, .cesium-credit-text, .cesium-credit-logoContainer, .cesium-credit-expand-link, .cesium-credit-logo, .cesium-widget-credits"
            );
            creditElements.forEach((element: Element) => {
              (element as HTMLElement).style.display = "none";
            });
          }
          // Also hide in the viewer's widget container
          const viewerElement = viewerRef.current.cesiumWidget?.container;
          if (viewerElement) {
            const creditElements = viewerElement.querySelectorAll(
              ".cesium-viewer-bottom, .cesium-credit-text, .cesium-credit-logoContainer, .cesium-credit-expand-link, .cesium-credit-logo, .cesium-widget-credits"
            );
            creditElements.forEach((element: Element) => {
              (element as HTMLElement).style.display = "none";
            });
          }
        };

        hideCredits();

        // Also hide after delays to catch dynamically added elements
        setTimeout(hideCredits, 50);
        setTimeout(hideCredits, 200);
        setTimeout(hideCredits, 500);

        // Use MutationObserver to hide credits as they're added
        const observer = new MutationObserver(() => {
          hideCredits();
        });
        const viewerElement = viewerRef.current.cesiumWidget?.container || containerRef.current;
        observer.observe(viewerElement, {
          childList: true,
          subtree: true,
        });

        // Store observer for cleanup
        (viewerRef.current as any)._creditObserver = observer;

        // Load the tileset
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(
          parseInt(cesiumAssetId)
        );

        tilesetRef.current = tileset;
        viewerRef.current.scene.primitives.add(tileset);

        // Focus camera on model
        await viewerRef.current.zoomTo(tileset);

        if (onViewerReady) {
          onViewerReady(viewerRef.current);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize Cesium");
        if (onError) {
          onError(error);
        }
      }
    };

    initializeCesium();

    // Cleanup
    return () => {
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (viewerRef.current) {
        // Remove tileset from primitives if it exists
        if (tilesetRef.current && viewerRef.current.scene) {
          try {
            viewerRef.current.scene.primitives.remove(tilesetRef.current);
          } catch {
            // Ignore cleanup errors
          }
          tilesetRef.current = null;
        }

        // Disconnect credit observer if it exists
        if ((viewerRef.current as any)._creditObserver) {
          (viewerRef.current as any)._creditObserver.disconnect();
        }
        try {
          viewerRef.current.destroy();
        } catch (err) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }
      // Also clean up any remaining Cesium viewers and elements in the container
      if (containerRef.current) {
        const cesiumViewers = containerRef.current.querySelectorAll(".cesium-viewer");
        cesiumViewers.forEach((viewer) => viewer.remove());
        const canvases = containerRef.current.querySelectorAll("canvas");
        canvases.forEach((canvas) => canvas.remove());
        const cesiumWidgets = containerRef.current.querySelectorAll(".cesium-widget");
        cesiumWidgets.forEach((widget) => widget.remove());
      }
      cesiumRef.current = null;
      isInitializing.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Empty dependency array ensures this only runs once, matching the main viewer pattern
    // The containerRef is stable and doesn't need to be in dependencies
  }, []);

  // This component doesn't render anything - it just initializes the viewer
  // The parent component handles rendering and uses the viewer via onViewerReady callback
  return null;
}

