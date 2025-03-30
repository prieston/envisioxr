"use client";

import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import useSceneStore from "../../../app/hooks/useSceneStore";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls";

type Vector3Tuple = [number, number, number];

interface CameraSpringControllerProps {
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
}

const CameraSpringController: React.FC<CameraSpringControllerProps> = ({
  orbitControlsRef,
}) => {
  const { camera } = useThree();
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const capturingPOV = useSceneStore((state) => state.capturingPOV);

  const [spring, api] = useSpring(() => ({
    cameraPosition: camera.position.toArray() as Vector3Tuple,
    target: orbitControlsRef.current
      ? (orbitControlsRef.current.target.toArray() as Vector3Tuple)
      : ([0, 0, 0] as Vector3Tuple),
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  // Only animate when in preview mode and not capturing POV
  useEffect(() => {
    if (previewMode && observationPoints.length > 0 && !capturingPOV) {
      const currentPoint = observationPoints[previewIndex];
      if (currentPoint && currentPoint.position && currentPoint.target) {
        // Ensure we have valid arrays for position and target
        const position = Array.isArray(currentPoint.position)
          ? (currentPoint.position as Vector3Tuple)
          : ([0, 0, 0] as Vector3Tuple);
        const target = Array.isArray(currentPoint.target)
          ? (currentPoint.target as Vector3Tuple)
          : ([0, 0, 0] as Vector3Tuple);

        // Start the camera transition
        api.start({
          cameraPosition: position,
          target: target,
        });

        // Update the orbit controls target immediately
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.set(...target);
          orbitControlsRef.current.update();
        }
      }
    } else if (capturingPOV) {
      // Stop any ongoing animations when capturing POV
      api.stop();
    }
  }, [
    previewMode,
    previewIndex,
    observationPoints,
    api,
    orbitControlsRef,
    capturingPOV,
  ]);

  // Only update camera position in preview mode and not capturing POV
  useFrame(() => {
    if (previewMode && !capturingPOV && orbitControlsRef.current) {
      const position = spring.cameraPosition.get() as Vector3Tuple;
      const target = spring.target.get() as Vector3Tuple;

      if (Array.isArray(position) && Array.isArray(target)) {
        camera.position.set(position[0], position[1], position[2]);
        orbitControlsRef.current.target.set(target[0], target[1], target[2]);
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
};

export default CameraSpringController;
