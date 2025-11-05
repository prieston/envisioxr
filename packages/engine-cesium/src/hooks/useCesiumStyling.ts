/**
 * Hook for managing viewer styling and resize handling
 */

import { useEffect } from "react";

export function useCesiumStyling(
  viewer: any,
  containerRef: React.RefObject<HTMLDivElement>,
  isLoading: boolean
) {
  useEffect(() => {
    if (!viewer || isLoading) return;

    const applyStyling = () => {
      const viewerElement = viewer.cesiumWidget.container;
      if (!viewerElement) return;

      // Make the viewer take full size
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

      // Force Cesium to resize immediately to prevent the 300x300 flash
      if (viewer.cesiumWidget) {
        viewer.cesiumWidget.resize();
      }
    };

    // Apply styling immediately
    applyStyling();

    // Also apply after a short delay to catch any dynamic elements
    const timeoutId = setTimeout(applyStyling, 100);

    // Set up ResizeObserver to handle container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (viewer?.cesiumWidget) {
          viewer.cesiumWidget.resize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isLoading, viewer, containerRef]);
}

