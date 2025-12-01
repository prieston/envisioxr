import { useEffect } from "react";

interface UseCameraControllerOptions {
  viewer: any | null;
  enableLocationEditing: boolean;
}

/**
 * Hook to configure camera controller for model preview
 */
export function useCameraController({
  viewer,
  enableLocationEditing,
}: UseCameraControllerOptions) {
  useEffect(() => {
    if (!viewer || enableLocationEditing) return;

    // Check if viewer is destroyed
    if (viewer.isDestroyed && viewer.isDestroyed()) {
      return;
    }

    // Check if scene exists
    if (!viewer.scene) {
      return;
    }

    const controller = viewer.scene.screenSpaceCameraController;
    if (!controller) return;

    controller.enableRotate = true;
    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableTilt = true;

    if (controller.enableLook !== undefined) {
      controller.enableLook = false;
    }
  }, [viewer, enableLocationEditing]);
}
