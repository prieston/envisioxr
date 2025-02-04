"use client";

import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import useSceneStore from "@/hooks/useSceneStore";

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
        api.start({
          cameraPosition: currentPoint.position,
          target: currentPoint.target,
        });
      }
    }
  }, [previewMode, previewIndex, observationPoints, api]);

  useFrame(() => {
    const previewModeState = useSceneStore.getState().previewMode;
    if (previewModeState && orbitControlsRef.current) {
      camera.position.set(...spring.cameraPosition.get());
      orbitControlsRef.current.target.set(...spring.target.get());
      orbitControlsRef.current.update();
    }
  });

  return null;
};

export default CameraSpringController;
