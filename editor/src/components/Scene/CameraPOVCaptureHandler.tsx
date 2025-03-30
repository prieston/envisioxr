"use client";

import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import useSceneStore from "../../../app/hooks/useSceneStore";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls";

type Vector3Tuple = [number, number, number];

interface CameraPOVCaptureHandlerProps {
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
}

const CameraPOVCaptureHandler: React.FC<CameraPOVCaptureHandlerProps> = ({
  orbitControlsRef,
}) => {
  const { camera } = useThree();
  const capturingPOV = useSceneStore((state) => state.capturingPOV);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);

  useEffect(() => {
    if (capturingPOV && selectedObservation) {
      if (!orbitControlsRef.current) {
        console.warn("OrbitControls reference is null, cannot capture target.");
        return;
      }

      // Store the current camera state
      const currentPosition = new THREE.Vector3().copy(camera.position);
      const currentTarget = new THREE.Vector3().copy(
        orbitControlsRef.current.target
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
        if (!orbitControlsRef.current) return;

        // Update the orbit controls target
        orbitControlsRef.current.target.copy(currentTarget);
        orbitControlsRef.current.update();

        // Update the camera position and make it look at the target
        camera.position.copy(currentPosition);
        camera.lookAt(currentTarget);

        // Final update to ensure everything is in sync
        orbitControlsRef.current.update();

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
  ]);

  return null;
};

export default CameraPOVCaptureHandler;
