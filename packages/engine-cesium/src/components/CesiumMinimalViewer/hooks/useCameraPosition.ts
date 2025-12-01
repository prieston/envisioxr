import { useCallback } from "react";
import { positionCameraBasic } from "../utils/camera-utils";
import type { CesiumModule, TilesetTransformData } from "../types";
import { positionCameraForTileset } from "../../../utils/tileset-operations";
import { arrayToMatrix4 } from "../../../utils/tileset-transform";

interface UseCameraPositionOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
}

/**
 * Hook to manage camera positioning
 */
export function useCameraPosition({
  viewer,
  Cesium,
}: UseCameraPositionOptions) {
  const positionCamera = useCallback(
    (initialTransform?: number[]) => {
      if (!viewer || !Cesium) return;
      positionCameraBasic(viewer, Cesium, initialTransform);
    },
    [viewer, Cesium]
  );

  const zoomToTileset = useCallback(
    (
      tileset: any,
      transformToApply: TilesetTransformData | undefined,
      isNonGeoreferenced: boolean
    ) => {
      if (!viewer || !Cesium) return;

      try {
        const pitch = -0.5; // ~-28.6 degrees

        const boundingSphere = tileset.boundingSphere;

        if (boundingSphere) {
          if (isNonGeoreferenced) {
            // For non-georeferenced models, position them at a default Earth location (0,0)
            // so they show up in the viewer. This allows rotation and pan to work.
            const defaultLongitude = 0;
            const defaultLatitude = 0;
            const defaultHeight = 100; // Default height above sea level

            // Create position at default location
            const position = Cesium.Cartesian3.fromDegrees(
              defaultLongitude,
              defaultLatitude,
              defaultHeight
            );

            // Create transform matrix to position model at default location
            // Use eastNorthUpToFixedFrame to create a local ENU frame at the position
            const transformMatrix =
              Cesium.Transforms.eastNorthUpToFixedFrame(position);

            // Apply transform to tileset
            if (tileset && viewer && viewer.scene && !(viewer.isDestroyed && viewer.isDestroyed())) {
              tileset.modelMatrix = transformMatrix;
              viewer.scene.requestRender();
            }

            // Wait for bounding sphere to update after transform, then zoom to model
            setTimeout(() => {
              if (!viewer.isDestroyed() && tileset) {
                // Use zoomTo to properly frame the model after transform is applied
                viewer.zoomTo(
                  tileset,
                  new Cesium.HeadingPitchRange(0, pitch, 0)
                );
              }
            }, 200);
          } else {
            // For georeferenced models, use zoomTo without setting rotation target
            // This allows left-click drag to pan the earth instead of rotating around model
            viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, pitch, 0));
          }
        } else {
          // Fallback: use zoomTo if no bounding sphere
          viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, pitch, 0));
        }
      } catch (err) {
        console.warn("[useCameraPosition] Error zooming to tileset:", err);

        // Fallback: manual positioning from transform
        if (transformToApply) {
          let transformWithCoords = transformToApply;
          if (!transformToApply.longitude || !transformToApply.latitude) {
            // Extract position from matrix
            const matrix = arrayToMatrix4(Cesium, transformToApply.matrix);
            const translation = new Cesium.Cartesian3(
              matrix[12],
              matrix[13],
              matrix[14]
            );
            const cartographic = Cesium.Cartographic.fromCartesian(translation);
            transformWithCoords = {
              ...transformToApply,
              longitude: Cesium.Math.toDegrees(cartographic.longitude),
              latitude: Cesium.Math.toDegrees(cartographic.latitude),
              height: cartographic.height,
            };
          }
          positionCameraForTileset(viewer, Cesium, transformWithCoords, {
            offset: 200,
            duration: 1.5,
            pitch: -45,
          });
        } else {
          // Last resort: try zoomTo without options
          viewer.zoomTo(tileset);
        }
      }
    },
    [viewer, Cesium]
  );

  return {
    positionCamera,
    zoomToTileset,
  };
}
