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

        // Convert camera position from Cartesian3 to geographic coordinates
        const positionCartographic =
          Cesium.Cartographic.fromCartesian(currentPosition);
        const longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
        const latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
        const altitude = positionCartographic.height;

        // Calculate target point in front of camera
        const targetCartesian = Cesium.Cartesian3.add(
          currentPosition,
          Cesium.Cartesian3.multiplyByScalar(
            currentDirection,
            100,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );

        // Convert target from Cartesian3 to geographic coordinates
        const targetCartographic =
          Cesium.Cartographic.fromCartesian(targetCartesian);
        const targetLongitude = Cesium.Math.toDegrees(
          targetCartographic.longitude
        );
        const targetLatitude = Cesium.Math.toDegrees(
          targetCartographic.latitude
        );
        const targetAltitude = targetCartographic.height;

        const newPosition: Vector3Tuple = [latitude, longitude, altitude];
        const newTarget: Vector3Tuple = [
          targetLatitude,
          targetLongitude,
          targetAltitude,
        ];

        updateObservationPoint(selectedObservation.id, {
          position: newPosition,
          target: newTarget,
        });
      } catch (error) {
        // Ignore camera capture errors
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
