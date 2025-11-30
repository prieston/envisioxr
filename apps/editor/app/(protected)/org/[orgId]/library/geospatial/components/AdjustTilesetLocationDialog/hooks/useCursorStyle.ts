import { useEffect } from "react";

export function useCursorStyle(
  viewerRef: React.MutableRefObject<any>,
  clickModeEnabled: boolean,
  open: boolean
) {
  useEffect(() => {
    if (!viewerRef.current || !open) return;

    const canvas = viewerRef.current.scene?.canvas;
    if (!canvas) return;

    // Crosshair when click mode is enabled, normal cursor otherwise
    if (clickModeEnabled) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "auto";
    }

    return () => {
      if (canvas) {
        canvas.style.cursor = "auto";
      }
    };
  }, [clickModeEnabled, open, viewerRef]);
}

