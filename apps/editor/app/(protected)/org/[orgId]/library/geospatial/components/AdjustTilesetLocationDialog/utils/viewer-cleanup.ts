/**
 * Cleanup Cesium viewer and DOM elements
 */
export function cleanupCesiumViewer(
  containerRef: React.RefObject<HTMLDivElement>,
  viewerRef: React.MutableRefObject<any>
): void {
  // Destroy viewer instance
  if (viewerRef.current) {
    try {
      viewerRef.current.destroy();
    } catch (err) {
      // Ignore cleanup errors
    }
    viewerRef.current = null;
  }

  // Clean up DOM elements
  if (containerRef.current) {
    const cesiumViewers =
      containerRef.current.querySelectorAll(".cesium-viewer");
    cesiumViewers.forEach((viewer) => {
      if (viewer.parentNode) {
        try {
          viewer.remove();
        } catch (err) {
          // Ignore errors if node was already removed
        }
      }
    });

    const canvases = containerRef.current.querySelectorAll("canvas");
    canvases.forEach((canvas) => {
      if (canvas.parentNode) {
        try {
          canvas.remove();
        } catch (err) {
          // Ignore errors if node was already removed
        }
      }
    });

    const cesiumWidgets =
      containerRef.current.querySelectorAll(".cesium-widget");
    cesiumWidgets.forEach((widget) => {
      if (widget.parentNode) {
        try {
          widget.remove();
        } catch (err) {
          // Ignore errors if node was already removed
        }
      }
    });
  }
}

