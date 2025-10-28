"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import type { ViewshedAnalysisProps, SensorRefs } from "./types";
import {
  useIonSDKInitialization,
  useSensorCleanup,
  useSensorPoseUpdate,
} from "./hooks";
import {
  createSensor,
  computeShapeSignature,
  createPreviewHandler,
  initializePreviewGlobals,
} from "./core";
import { removeSensor } from "./utils";

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
  const viewshedRef = useRef<any>(null);
  const lastShapeSigRef = useRef<string>("");
  const mountedRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const isCreatingRef = useRef(false);
  const creatingShapeSigRef = useRef<string>("");

  const currentShapeSig = useMemo(
    () => computeShapeSignature(observationProperties),
    [
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
    ]
  );

  const refs: SensorRefs = useMemo(
    () => ({
      sensorRef,
      sensorCompositeRef: { current: null },
      viewshedRef,
    }),
    []
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, [objectId]);

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

    const shapeSig = currentShapeSig;

    // Prevent concurrent creation of the same shape
    if (creatingShapeSigRef.current === shapeSig) return;

    // Check if sensor already exists with correct shape
    if (sensorRef.current && lastShapeSigRef.current === shapeSig) return;

    // Check if another shape is being created
    if (creatingShapeSigRef.current !== "") return;

    // Check if shape signature actually changed
    if (lastShapeSigRef.current === shapeSig) return;

    // Claim creation lock
    creatingShapeSigRef.current = shapeSig;

    // Prevent concurrent operations
    if (isTransitioningRef.current || isCreatingRef.current) {
      creatingShapeSigRef.current = "";
      return;
    }

    const oldSig = lastShapeSigRef.current;
    lastShapeSigRef.current = shapeSig;
    isCreatingRef.current = true;
    isTransitioningRef.current = true;

    let created = false;
    try {
      // Clean up old sensor if exists
      if (sensorRef.current) {
        removeSensor(sensorRef.current, cesiumViewer);
      }
      sensorRef.current = null;

      // Create new sensor
      const { sensor } = createSensor({
        viewer: cesiumViewer,
        position,
        rotation,
        properties: observationProperties,
      });

      sensorRef.current = sensor;
      created = true;
    } catch (err) {
      console.error("[ViewshedAnalysis] Failed to create sensor:", err);
      toast.error(`Failed to create sensor: ${(err as any)?.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      if (!created) {
        lastShapeSigRef.current = oldSig;
      }
      isCreatingRef.current = false;
      isTransitioningRef.current = false;
      creatingShapeSigRef.current = "";
    }
  }, [
    isInitialized,
    cesiumViewer,
    currentShapeSig,
    position,
    rotation,
    observationProperties,
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [isInitialized, createIonSDKSensor]);

  // Register preview handler for live updates
  const observationPropertiesRef = useRef(observationProperties);
  useEffect(() => {
    observationPropertiesRef.current = observationProperties;
  }, [observationProperties]);

  useEffect(() => {
    if (!isInitialized) return;
    initializePreviewGlobals();

    const handlePreview = createPreviewHandler({
      objectId,
      sensorRef,
      isTransitioningRef,
      propertiesRef: observationPropertiesRef,
      viewer: cesiumViewer,
    });

    window.addEventListener("cesium-observation-preview", handlePreview);
    return () => {
      window.removeEventListener("cesium-observation-preview", handlePreview);
    };
  }, [isInitialized, objectId, cesiumViewer]);

  return null;
};

export default ViewshedAnalysis;
