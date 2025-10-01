"use client";

import { useEffect } from "react";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core";

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
        const camera = cesiumViewer.camera;
        const currentPosition = Cesium.Cartesian3.clone(camera.position);
        const currentDirection = Cesium.Cartesian3.clone(camera.direction);

        const currentTarget = Cesium.Cartesian3.add(
          currentPosition,
          currentDirection,
          new Cesium.Cartesian3()
        );

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

        updateObservationPoint(selectedObservation.id, {
          position: newPosition,
          target: newTarget,
        });
      } catch (error) {}
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
