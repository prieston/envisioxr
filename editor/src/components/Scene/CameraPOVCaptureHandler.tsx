"use client";

import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import useSceneStore from "../../../app/hooks/useSceneStore";

const CameraPOVCaptureHandler = ({ orbitControlsRef }) => {
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
      const newPosition = JSON.parse(JSON.stringify(camera.position.toArray()));
      const newTarget = JSON.parse(
        JSON.stringify(orbitControlsRef.current.target.toArray())
      );
      updateObservationPoint(selectedObservation.id, {
        position: newPosition,
        target: newTarget,
      });
      setCapturingPOV(false);
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
