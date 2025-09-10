"use client";

import { useEffect } from "react";
import useSceneStore from "../../hooks/useSceneStore";

const CesiumPreviewModeController: React.FC = () => {
  const cesiumViewer = useSceneStore((state) => state.cesiumViewer);
  const previewMode = useSceneStore((state) => state.previewMode);

  useEffect(() => {
    if (!cesiumViewer || !cesiumViewer.scene) return;

    const controller = cesiumViewer.scene.screenSpaceCameraController;
    if (!controller) return;

    if (previewMode) {
      // Disable all camera controls when in preview mode
      controller.enableRotate = false;
      controller.enableTranslate = false;
      controller.enableZoom = false;
      controller.enableTilt = false;

      // Also disable any custom camera controllers that might be active
      // This ensures that simulation modes don't interfere with preview mode
      if (cesiumViewer.scene.screenSpaceCameraController) {
        cesiumViewer.scene.screenSpaceCameraController.enableLook = false;
      }

      console.log(
        "[CesiumPreviewModeController] Controls disabled for preview mode"
      );
    } else {
      // Re-enable camera controls when not in preview mode
      controller.enableRotate = true;
      controller.enableTranslate = true;
      controller.enableZoom = true;
      controller.enableTilt = true;

      // Re-enable look controls
      if (cesiumViewer.scene.screenSpaceCameraController) {
        cesiumViewer.scene.screenSpaceCameraController.enableLook = true;
      }

      console.log(
        "[CesiumPreviewModeController] Controls enabled for free navigation"
      );
    }
  }, [cesiumViewer, previewMode]);

  return null;
};

export default CesiumPreviewModeController;
