"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import * as Cesium from "cesium";
import type { ViewshedAnalysisProps, SensorRefs } from "./types";
import {
  useIonSDKInitialization,
  useSensorCleanup,
  useSensorPoseUpdate,
} from "./hooks";
import {
  createSensor,
  computeShapeSignature,
  updateSensorFovRadius,
  applySensorStyle,
  createPreviewHandler,
  initializePreviewGlobals,
} from "./core";
import { removeComposite, removeSensor } from "./utils";

const ViewshedAnalysis: React.FC<ViewshedAnalysisProps> = ({
  position,
  rotation,
  observationProperties,
  objectId,
  cesiumViewer: providedViewer,
}) => {
  const cesiumViewer = providedViewer || (window as any).cesiumViewer;
  const isInitialized = useIonSDKInitialization(cesiumViewer);

  const sensorRef = useRef<any>(null);
  const sensorCompositeRef = useRef<any>(null);
  const viewshedRef = useRef<any>(null);
  const lastShapeSigRef = useRef<string>("");
  const mountedRef = useRef(true);
  const isTransitioningRef = useRef(false);

  const refs: SensorRefs = {
    sensorRef,
    sensorCompositeRef,
    viewshedRef,
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useSensorCleanup(refs, cesiumViewer, lastShapeSigRef);

  useSensorPoseUpdate(
    isInitialized,
    refs,
    {
      position,
      rotation,
      sensorForwardAxis: observationProperties.sensorForwardAxis ?? "X+",
      modelFrontAxis: observationProperties.modelFrontAxis ?? "Z+",
      tiltDeg: observationProperties.tiltDeg ?? 0,
    },
    cesiumViewer
  );

  const createIonSDKSensor = useCallback(() => {
    if (!isInitialized || !cesiumViewer) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    try {
      const shapeSig = computeShapeSignature(observationProperties);

      if (lastShapeSigRef.current === shapeSig) {
        return;
      }
      lastShapeSigRef.current = shapeSig;

      removeComposite(sensorCompositeRef.current, cesiumViewer);
      sensorCompositeRef.current = null;

      removeSensor(sensorRef.current, cesiumViewer);
      sensorRef.current = null;

      const { sensor } = createSensor({
        viewer: cesiumViewer,
        position,
        rotation,
        properties: observationProperties,
      });

      sensorRef.current = sensor;
    } catch (err) {
      console.error("Error creating Ion SDK sensor:", err);
      toast.error(`Failed to create sensor: ${(err as any)?.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      isTransitioningRef.current = false;
    }
    // Note: position/rotation intentionally excluded - shape signature guards recreation
    // and these arrays cause unnecessary callback recreation on every render
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.sensorType,
    observationProperties.include3DModels,
    observationProperties.sensorType === "rectangle"
      ? observationProperties.fovH
      : undefined,
    observationProperties.sensorType === "rectangle"
      ? observationProperties.fovV
      : undefined,
    observationProperties.alignWithModelFront,
    observationProperties.manualFrontDirection,
    observationProperties.modelFrontAxis,
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [isInitialized, createIonSDKSensor]);

  // NOTE: FOV and radius updates are handled by the preview handler above
  // This effect should NOT run on fov/visibilityRadius changes to avoid duplicate handling

  useEffect(() => {
    if (!isInitialized) return;
    initializePreviewGlobals();

    const handlePreview = createPreviewHandler({
      objectId,
      sensorRef,
      isTransitioningRef,
      properties: observationProperties,
      viewer: cesiumViewer,
    });

    window.addEventListener("cesium-observation-preview", handlePreview);
    return () => {
      window.removeEventListener("cesium-observation-preview", handlePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isInitialized,
    objectId,
    cesiumViewer,
    // NOTE: fov and visibilityRadius are NOT in deps
    // because the handler reads them from the closure
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!sensorRef.current) return;

    try {
      applySensorStyle(sensorRef.current, observationProperties, cesiumViewer);
    } catch (err) {
      console.warn("Failed to update visibility flags:", err);
    }
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.showSensorGeometry,
    observationProperties.showViewshed,
    observationProperties.sensorType,
  ]);

  return null;
};

export default ViewshedAnalysis;
