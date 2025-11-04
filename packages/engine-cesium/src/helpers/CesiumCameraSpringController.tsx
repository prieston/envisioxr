"use client";

import React, { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core";

type Vector3Tuple = [number, number, number];

const CesiumCameraSpringController: React.FC = () => {
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 6 to 1
  const sceneState = useSceneStore((state) => ({
    cesiumViewer: state.cesiumViewer,
    previewMode: state.previewMode,
    setPreviewMode: state.setPreviewMode,
    previewIndex: state.previewIndex,
    observationPoints: state.observationPoints,
    capturingPOV: state.capturingPOV,
  }));

  // Destructure for cleaner lookups
  const {
    cesiumViewer,
    previewMode,
    setPreviewMode,
    previewIndex,
    observationPoints,
    capturingPOV,
  } = sceneState;

  const animationRef = useRef<number | null>(null);

  const startCameraAnimation = (
    startPos: Cesium.Cartesian3,
    startTarget: Cesium.Cartesian3,
    endPos: Cesium.Cartesian3,
    endTarget: Cesium.Cartesian3
  ) => {
    if (!cesiumViewer) return;

    // Cancel any ongoing animation
    if (animationRef.current) {
      cesiumViewer.camera.cancelFlight();
    }

    // Calculate the direction from end position to end target
    const direction = Cesium.Cartesian3.subtract(
      endTarget,
      endPos,
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(direction, direction);

    // Calculate the up vector
    const up = cesiumViewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
      endPos,
      new Cesium.Cartesian3()
    );

    // Use Cesium's built-in flyTo for smooth, synchronized camera movement
    cesiumViewer.camera.flyTo({
      destination: endPos,
      orientation: {
        direction: direction,
        up: up,
      },
      duration: 1.5, // 1.5 seconds
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      complete: () => {
        // Animation complete - keep preview mode on for next/prev navigation
        animationRef.current = null;
      },
    });

    // Store a reference to track that animation is running
    // We'll use a dummy value since flyTo manages its own animation
    animationRef.current = 1 as any;
  };

  useEffect(() => {
    // Cancel any ongoing animation first
    if (animationRef.current && cesiumViewer) {
      cesiumViewer.camera.cancelFlight();
      animationRef.current = null;
    }

    if (
      previewMode &&
      observationPoints.length > 0 &&
      !capturingPOV &&
      cesiumViewer
    ) {
      const currentPoint = observationPoints[previewIndex];

      if (currentPoint && currentPoint.position && currentPoint.target) {
        const position = Array.isArray(currentPoint.position)
          ? (currentPoint.position as Vector3Tuple)
          : ([0, 0, 0] as Vector3Tuple);
        const target = Array.isArray(currentPoint.target)
          ? (currentPoint.target as Vector3Tuple)
          : ([0, 0, 0] as Vector3Tuple);

        const startPos = Cesium.Cartesian3.clone(cesiumViewer.camera.position);
        const startTarget = Cesium.Cartesian3.add(
          startPos,
          Cesium.Cartesian3.clone(cesiumViewer.camera.direction),
          new Cesium.Cartesian3()
        );

        // Convert geographic coordinates (lat, long, alt) to Cartesian3
        // position is [latitude, longitude, altitude]
        const endPos = Cesium.Cartesian3.fromDegrees(
          position[1], // longitude
          position[0], // latitude
          position[2] // altitude
        );
        const endTarget = Cesium.Cartesian3.fromDegrees(
          target[1], // longitude
          target[0], // latitude
          target[2] // altitude
        );

        startCameraAnimation(startPos, startTarget, endPos, endTarget);
      }
    }
  }, [
    previewMode,
    previewIndex,
    observationPoints,
    capturingPOV,
    cesiumViewer,
  ]);

  useEffect(() => {
    return () => {
      if (animationRef.current && cesiumViewer) {
        cesiumViewer.camera.cancelFlight();
      }
    };
  }, [cesiumViewer]);

  return null;
};

export default CesiumCameraSpringController;
