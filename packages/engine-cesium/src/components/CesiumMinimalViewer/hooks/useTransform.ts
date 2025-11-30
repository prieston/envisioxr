import { useEffect, useRef } from "react";
import { arrayToMatrix4 } from "../../../utils/tileset-transform";
import { positionCameraBasic } from "../utils/camera-utils";
import type { CesiumModule } from "../types";

interface UseTransformOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
  tileset: any | null;
  initialTransform?: number[];
  enableLocationEditing: boolean;
}

/**
 * Hook to manage transform application
 */
export function useTransform({
  viewer,
  Cesium,
  tileset,
  initialTransform,
  enableLocationEditing,
}: UseTransformOptions) {
  const hasAppliedInitialCamera = useRef(false);
  const isInitialLoad = useRef(true);
  const hasAppliedInitialTransform = useRef(false);

  useEffect(() => {
    if (
      !viewer ||
      !tileset ||
      !Cesium ||
      !initialTransform ||
      initialTransform.length !== 16
    ) {
      return;
    }

    // In location editing mode, only apply transform on initial load
    // Subsequent changes are handled directly by the parent component (handleApplyManualChanges)
    // This prevents the transform from being re-applied when rotation/position changes,
    // which would cause the model to appear to be recreated
    if (enableLocationEditing && hasAppliedInitialTransform.current) {
      return;
    }

    const matrix = arrayToMatrix4(Cesium, initialTransform);

    // Verify the matrix round-trips correctly (for debugging)
    Cesium.Matrix4.toArray(matrix, new Array(16)).every(
      (val: number, i: number) =>
        Math.abs(val - initialTransform[i]) < 0.0000001
    );

    tileset.modelMatrix = matrix;
    viewer.scene.requestRender();

    // Mark that we've applied the initial transform
    if (enableLocationEditing) {
      hasAppliedInitialTransform.current = true;
    }

    // Only position camera on very first load when dialog opens with existing transform
    // NOT on subsequent clicks/repositions
    if (
      enableLocationEditing &&
      !hasAppliedInitialCamera.current &&
      isInitialLoad.current
    ) {
      positionCameraBasic(viewer, Cesium, initialTransform);
      hasAppliedInitialCamera.current = true;
      isInitialLoad.current = false;
    }
  }, [viewer, Cesium, tileset, initialTransform, enableLocationEditing]);
}
