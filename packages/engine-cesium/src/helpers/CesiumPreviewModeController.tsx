"use client";

import { useEffect } from "react";
import { useSceneStore } from "@klorad/core";

const CesiumPreviewModeController: React.FC = () => {
  const cesiumViewer = useSceneStore((state) => state.cesiumViewer);
  const previewMode = useSceneStore((state) => state.previewMode);

  useEffect(() => {
    if (!cesiumViewer || !cesiumViewer.scene) return;
    const controller = cesiumViewer.scene.screenSpaceCameraController;
    if (!controller) return;

    if (previewMode) {
      controller.enableRotate = false;
      controller.enableTranslate = false;
      controller.enableZoom = false;
      controller.enableTilt = false;
      if (cesiumViewer.scene.screenSpaceCameraController) {
        cesiumViewer.scene.screenSpaceCameraController.enableLook = false;
      }
    } else {
      controller.enableRotate = true;
      controller.enableTranslate = true;
      controller.enableZoom = true;
      controller.enableTilt = true;
      if (cesiumViewer.scene.screenSpaceCameraController) {
        cesiumViewer.scene.screenSpaceCameraController.enableLook = true;
      }
    }
  }, [cesiumViewer, previewMode]);

  return null;
};

export default CesiumPreviewModeController;
