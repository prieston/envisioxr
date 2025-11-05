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
import { applySensorStyle } from "./core/sensor-updater";
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

  // Keep observationProperties, position, and rotation in refs to avoid unnecessary callback recreation
  // Position/rotation updates are handled by useSensorPoseUpdate, so we only need to recreate
  // the sensor when the shape signature changes
  const observationPropertiesRef = useRef(observationProperties);
  const positionRef = useRef(position);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    observationPropertiesRef.current = observationProperties;
    positionRef.current = position;
    rotationRef.current = rotation;
  }, [observationProperties, position, rotation]);

  const createIonSDKSensor = useCallback(async () => {
    if (!isInitialized || !cesiumViewer) {
      return;
    }

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

      // Create new sensor (async - loads vendor SDK client-only)
      // Use refs to get latest values without causing callback recreation
      const { sensor } = await createSensor({
        viewer: cesiumViewer,
        position: positionRef.current,
        rotation: rotationRef.current,
        properties: observationPropertiesRef.current,
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
  }, [isInitialized, cesiumViewer, currentShapeSig, objectId]);

  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [isInitialized, createIonSDKSensor]);

  // Update sensor visibility flags when showSensorGeometry or showViewshed changes
  useEffect(() => {
    if (!isInitialized || !cesiumViewer || !sensorRef.current) return;

    // Skip if sensor is being created or transitioned
    if (isTransitioningRef.current || isCreatingRef.current) return;

    // Update sensor flags and colors directly without recreating the sensor
    try {
      applySensorStyle(sensorRef.current, observationProperties, cesiumViewer);
    } catch (err) {
      // Failed to update - sensor might be destroyed
    }
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.showSensorGeometry,
    observationProperties.showViewshed,
    observationProperties.sensorColor,
  ]);

  // Register preview handler for live updates
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
