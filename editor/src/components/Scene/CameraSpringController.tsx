"use client";

import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import useSceneStore from "../../../app/hooks/useSceneStore";

const CameraSpringController = ({ orbitControlsRef }) => {
  const { camera } = useThree();
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);

  const [spring, api] = useSpring(() => ({
    cameraPosition: camera.position.toArray(),
    target: orbitControlsRef.current
      ? orbitControlsRef.current.target.toArray()
      : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  useEffect(() => {
    if (previewMode && observationPoints.length > 0) {
      const currentPoint = observationPoints[previewIndex];
      if (currentPoint && currentPoint.position && currentPoint.target) {
        // Ensure we have valid arrays for position and target
        const position = Array.isArray(currentPoint.position)
          ? currentPoint.position
          : [0, 0, 0];
        const target = Array.isArray(currentPoint.target)
          ? currentPoint.target
          : [0, 0, 0];

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
    }
  }, [previewMode, previewIndex, observationPoints, api, orbitControlsRef]);

  useFrame(() => {
    if (previewMode && orbitControlsRef.current) {
      const position = spring.cameraPosition.get();
      const target = spring.target.get();

      if (Array.isArray(position) && Array.isArray(target)) {
        camera.position.set(...position);
        orbitControlsRef.current.target.set(...target);
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
};

export default CameraSpringController;
