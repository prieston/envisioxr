"use client";

import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import useSceneStore from "../../../app/hooks/useSceneStore";
import * as THREE from "three";

type Vector3Tuple = [number, number, number];

const CameraPOVCaptureHandler: React.FC = () => {
  const { camera } = useThree();
  const capturingPOV = useSceneStore((state) => state.capturingPOV);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);
  const viewMode = useSceneStore((state) => state.viewMode);
  const orbitControlsRef = useSceneStore((state) => state.orbitControlsRef);

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
        forward
      );

      // Convert to arrays for storage
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
