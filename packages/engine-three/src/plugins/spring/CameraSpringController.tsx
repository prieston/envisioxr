"use client";

import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import { useSceneStore } from "@klorad/core";

type Vector3Tuple = [number, number, number];

const CameraSpringController: React.FC = () => {
  const { camera } = useThree();
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 6 to 1
  const sceneState = useSceneStore((state) => ({
    previewMode: state.previewMode,
    previewIndex: state.previewIndex,
    observationPoints: state.observationPoints,
    capturingPOV: state.capturingPOV,
    viewMode: state.viewMode,
    orbitControlsRef: state.orbitControlsRef,
  }));

  // Destructure for cleaner lookups
  const {
    previewMode,
    previewIndex,
    observationPoints,
    capturingPOV,
    viewMode,
    orbitControlsRef,
  } = sceneState;

  const [spring, api] = useSpring(() => ({
    cameraPosition: camera.position.toArray() as Vector3Tuple,
    target: [0, 0, 0] as Vector3Tuple,
    config: {
      mass: 1.2, // Slightly reduced mass for more responsive movement
      tension: 150, // Increased tension for faster movement
      friction: 25, // Reduced friction for quicker response
      precision: 0.001, // Maintain precision for smooth interpolation
    },
  }));

  // Update spring target when orbitControlsRef becomes available
  useEffect(() => {
    if (orbitControlsRef) {
      api.start({
        target: orbitControlsRef.target.toArray() as Vector3Tuple,
      });
    }
  }, [orbitControlsRef, api]);

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
          config: {
            mass: 1.2,
            tension: 150,
            friction: 25,
            precision: 0.001,
          },
        });

        // Update orbit controls target
        if (viewMode === "orbit" && orbitControlsRef) {
          orbitControlsRef.target.set(...target);
          orbitControlsRef.update();
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
    viewMode,
  ]);

  // Only update camera position in preview mode and not capturing POV
  useFrame(() => {
    if (previewMode && !capturingPOV) {
      const position = spring.cameraPosition.get() as Vector3Tuple;
      const target = spring.target.get() as Vector3Tuple;

      if (Array.isArray(position) && Array.isArray(target)) {
        camera.position.set(position[0], position[1], position[2]);
        camera.lookAt(target[0], target[1], target[2]);

        // Only update orbit controls if in orbit mode
        if (viewMode === "orbit" && orbitControlsRef.current) {
          orbitControlsRef.current.target.set(target[0], target[1], target[2]);
          orbitControlsRef.current.update();
        }
      }
    }
  });

  return null;
};

export default CameraSpringController;
