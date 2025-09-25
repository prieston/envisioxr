"use client";

import React, { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core/state";

type Vector3Tuple = [number, number, number];

const CesiumCameraSpringController: React.FC = () => {
  const cesiumViewer = useSceneStore((state) => state.cesiumViewer);
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const capturingPOV = useSceneStore((state) => state.capturingPOV);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startPositionRef = useRef<Cesium.Cartesian3 | null>(null);
  const startTargetRef = useRef<Cesium.Cartesian3 | null>(null);
  const targetPositionRef = useRef<Cesium.Cartesian3 | null>(null);
  const targetTargetRef = useRef<Cesium.Cartesian3 | null>(null);

  const animationDuration = 1500;
  const easingFunction = (t: number) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const startCameraAnimation = (
    startPos: Cesium.Cartesian3,
    startTarget: Cesium.Cartesian3,
    endPos: Cesium.Cartesian3,
    endTarget: Cesium.Cartesian3
  ) => {
    if (!cesiumViewer) return;

    startPositionRef.current = startPos;
    startTargetRef.current = startTarget;
    targetPositionRef.current = endPos;
    targetTargetRef.current = endTarget;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (
        !cesiumViewer ||
        !startPositionRef.current ||
        !startTargetRef.current ||
        !targetPositionRef.current ||
        !targetTargetRef.current
      ) {
        return;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      const eased = easingFunction(progress);

      const currentPosition = Cesium.Cartesian3.lerp(
        startPositionRef.current,
        targetPositionRef.current,
        eased,
        new Cesium.Cartesian3()
      );

      const currentTarget = Cesium.Cartesian3.lerp(
        startTargetRef.current,
        targetTargetRef.current,
        eased,
        new Cesium.Cartesian3()
      );

      const direction = Cesium.Cartesian3.subtract(
        currentTarget,
        currentPosition,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.normalize(direction, direction);

      const up = cesiumViewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
        currentPosition,
        new Cesium.Cartesian3()
      );

      cesiumViewer.camera.setView({
        destination: currentPosition,
        orientation: { direction, up },
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
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
        const endPos = new Cesium.Cartesian3(
          position[0],
          position[1],
          position[2]
        );
        const endTarget = new Cesium.Cartesian3(
          target[0],
          target[1],
          target[2]
        );

        startCameraAnimation(startPos, startTarget, endPos, endTarget);
      }
    } else if (capturingPOV) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return null;
};

export default CesiumCameraSpringController;
