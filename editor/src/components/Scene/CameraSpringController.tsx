"use client";

import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import useSceneStore from "../../../app/hooks/useSceneStore";
import * as THREE from "three";

type Vector3Tuple = [number, number, number];

const CameraSpringController: React.FC = () => {
  const { camera } = useThree();
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const capturingPOV = useSceneStore((state) => state.capturingPOV);
  const viewMode = useSceneStore((state) => state.viewMode);
  const orbitControlsRef = useSceneStore((state) => state.orbitControlsRef);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );

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
        });

        // Update the orbit controls target immediately if in orbit mode
        if (viewMode === "orbit" && orbitControlsRef) {
          orbitControlsRef.target.set(...target);
          orbitControlsRef.update();
        }
      }
    } else if (!previewMode && selectedObservation) {
      // When not in preview mode, still update camera to match observation point
      const position = Array.isArray(selectedObservation.position)
        ? (selectedObservation.position as Vector3Tuple)
        : ([0, 0, 0] as Vector3Tuple);
      const target = Array.isArray(selectedObservation.target)
        ? (selectedObservation.target as Vector3Tuple)
        : ([0, 0, 0] as Vector3Tuple);

      // Update camera position and target without animation
      camera.position.set(...position);
      camera.lookAt(...target);

      // Update orbit controls if in orbit mode
      if (viewMode === "orbit" && orbitControlsRef) {
        orbitControlsRef.target.set(...target);
        orbitControlsRef.update();
      }
    } else if (capturingPOV) {
      // Stop any ongoing animations when capturing POV
      api.stop();
    }
  }, [
    previewMode,
    previewIndex,
    observationPoints,
    selectedObservation,
    api,
    orbitControlsRef,
    capturingPOV,
    viewMode,
    camera,
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
    } else if (
      !previewMode &&
      selectedObservation &&
      selectedObservation.position &&
      selectedObservation.target
    ) {
      // When not in preview mode, maintain the same camera position relative to target
      const position = Array.isArray(selectedObservation.position)
        ? (selectedObservation.position as Vector3Tuple)
        : ([0, 0, 0] as Vector3Tuple);
      const target = Array.isArray(selectedObservation.target)
        ? (selectedObservation.target as Vector3Tuple)
        : ([0, 0, 0] as Vector3Tuple);

      // Calculate the direction vector from target to position
      const direction = new THREE.Vector3(...position).sub(
        new THREE.Vector3(...target)
      );
      const distance = direction.length();

      // Normalize the direction
      direction.normalize();

      // Set the camera position maintaining the same distance
      camera.position.set(...target).add(direction.multiplyScalar(distance));
      camera.lookAt(...target);

      // Update orbit controls if in orbit mode
      if (viewMode === "orbit" && orbitControlsRef.current) {
        orbitControlsRef.current.target.set(...target);
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
};

export default CameraSpringController;
