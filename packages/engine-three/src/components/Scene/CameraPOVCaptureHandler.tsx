"use client";

import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useSceneStore } from "@envisio/core";
import { localToGeographic } from "@envisio/core";
import * as THREE from "three";

type Vector3Tuple = [number, number, number];

const CameraPOVCaptureHandler: React.FC = () => {
  const { camera } = useThree();
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 7 to 1
  const sceneState = useSceneStore((state) => ({
    capturingPOV: state.capturingPOV,
    selectedObservation: state.selectedObservation,
    updateObservationPoint: state.updateObservationPoint,
    setCapturingPOV: state.setCapturingPOV,
    viewMode: state.viewMode,
    orbitControlsRef: state.orbitControlsRef,
    tilesRenderer: state.tilesRenderer,
  }));

  // Destructure for cleaner lookups
  const {
    capturingPOV,
    selectedObservation,
    updateObservationPoint,
    setCapturingPOV,
    viewMode,
    orbitControlsRef,
    tilesRenderer,
  } = sceneState;

  useEffect(() => {
    if (capturingPOV && selectedObservation) {
      setCapturingPOV(false);
      // Store the current camera state
      const currentPosition = new THREE.Vector3().copy(camera.position);

      // Calculate target based on camera's forward direction
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
        camera.quaternion
      );
      const currentTarget = new THREE.Vector3().addVectors(
        currentPosition,
        forward.multiplyScalar(100)
      );

      // Convert local coordinates to geographic if tilesRenderer is available
      let newPosition: Vector3Tuple;
      let newTarget: Vector3Tuple;

      if (tilesRenderer) {
        const posGeo = localToGeographic(tilesRenderer, currentPosition);
        const targetGeo = localToGeographic(tilesRenderer, currentTarget);
        newPosition = [posGeo.latitude, posGeo.longitude, posGeo.altitude];
        newTarget = [
          targetGeo.latitude,
          targetGeo.longitude,
          targetGeo.altitude,
        ];
      } else {
        // Fallback to local coordinates if no tilesRenderer
        newPosition = [
          currentPosition.x,
          currentPosition.y,
          currentPosition.z,
        ];
        newTarget = [currentTarget.x, currentTarget.y, currentTarget.z];
      }

      // Update the observation point with the new position and target
      updateObservationPoint(selectedObservation.id, {
        position: newPosition,
        target: newTarget,
      });

      // Ensure the camera and controls maintain their state
      requestAnimationFrame(() => {
        // Update the camera position and make it look at the target
        camera.position.copy(currentPosition);
        camera.lookAt(currentTarget);

        // If we're in orbit mode, update the orbit controls target
        if (viewMode === "orbit" && orbitControlsRef.current) {
          orbitControlsRef.current.target.copy(currentTarget);
          orbitControlsRef.current.update();
        }

        // Set capturingPOV to false after the camera state is maintained
        setCapturingPOV(false);
      });
    }
  }, [
    capturingPOV,
    selectedObservation,
    camera,
    updateObservationPoint,
    setCapturingPOV,
    orbitControlsRef,
    viewMode,
  ]);

  return null;
};

export default CameraPOVCaptureHandler;
