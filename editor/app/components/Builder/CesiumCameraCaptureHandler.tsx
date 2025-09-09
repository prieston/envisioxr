"use client";

import { useEffect } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";

type Vector3Tuple = [number, number, number];

const CesiumCameraCaptureHandler: React.FC = () => {
  const cesiumViewer = useSceneStore((state) => state.cesiumViewer);
  const capturingPOV = useSceneStore((state) => state.capturingPOV);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);

  useEffect(() => {
    if (
      capturingPOV &&
      selectedObservation &&
      cesiumViewer &&
      cesiumViewer.camera
    ) {
      setCapturingPOV(false);

      try {
        // Get the current camera state from Cesium
        const camera = cesiumViewer.camera;
        const currentPosition = Cesium.Cartesian3.clone(camera.position);
        const currentDirection = Cesium.Cartesian3.clone(camera.direction);

        // Calculate the up vector parallel to the ground (East-North-Up basis)
        const { up } = cesiumViewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
          currentPosition,
          new Cesium.Cartesian3()
        );

        // Calculate target position by adding direction to position
        const currentTarget = Cesium.Cartesian3.add(
          currentPosition,
          currentDirection,
          new Cesium.Cartesian3()
        );

        // Convert Cesium Cartesian3 to arrays for storage
        const newPosition: Vector3Tuple = [
          currentPosition.x,
          currentPosition.y,
          currentPosition.z,
        ];

        const newTarget: Vector3Tuple = [
          currentTarget.x,
          currentTarget.y,
          currentTarget.z,
        ];

        // Update the observation point with the new position and target
        updateObservationPoint(selectedObservation.id, {
          position: newPosition,
          target: newTarget,
        });

        console.log("[CesiumCameraCaptureHandler] Camera position captured:", {
          position: newPosition,
          target: newTarget,
          up: [up.x, up.y, up.z],
          observationId: selectedObservation.id,
          observationTitle: selectedObservation.title,
        });

        // Show success feedback
        console.log(
          "✅ Camera position captured successfully for observation point:",
          selectedObservation.title
        );
      } catch (error) {
        console.error(
          "[CesiumCameraCaptureHandler] Error capturing camera position:",
          error
        );
      }
    }
  }, [
    capturingPOV,
    selectedObservation,
    cesiumViewer,
    updateObservationPoint,
    setCapturingPOV,
  ]);

  return null;
};

export default CesiumCameraCaptureHandler;
