"use client";

import { useEffect } from "react";
import * as Cesium from "cesium";
import { useSceneStore } from "@klorad/core";

type Vector3Tuple = [number, number, number];

const CesiumCameraCaptureHandler: React.FC = () => {
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 5 to 1
  const sceneState = useSceneStore((state) => ({
    cesiumViewer: state.cesiumViewer,
    capturingPOV: state.capturingPOV,
    selectedObservation: state.selectedObservation,
    updateObservationPoint: state.updateObservationPoint,
    setCapturingPOV: state.setCapturingPOV,
  }));

  // Destructure for cleaner lookups
  const {
    cesiumViewer,
    capturingPOV,
    selectedObservation,
    updateObservationPoint,
    setCapturingPOV,
  } = sceneState;

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
