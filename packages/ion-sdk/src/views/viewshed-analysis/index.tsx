"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useSceneStore } from "@envisio/core";
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
import { applySensorStyle, cancelPendingSensorStyleUpdates } from "./core/sensor-updater";
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

  // Check if this viewshed is active (selected object)
  const selectedObject = useSceneStore((s) => s.selectedObject);
  const isActive = useMemo(
    () => selectedObject?.id === objectId && selectedObject?.isObservationModel === true,
    [selectedObject?.id, objectId, selectedObject?.isObservationModel]
  );

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
    cesiumViewer,
    isActive
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
  // Also update immediately when isActive changes to ensure correct visibility state
  useEffect(() => {
    if (!isInitialized || !cesiumViewer || !sensorRef.current) return;

    // Skip if sensor is being created or transitioned
    if (isTransitioningRef.current || isCreatingRef.current) return;

    // When isActive changes, force immediate update to ensure visibility flags are correct
    // This prevents stale throttled updates from applying incorrect visibility
    try {
      // Cancel any pending throttled updates to ensure we apply correct state immediately
      cancelPendingSensorStyleUpdates(sensorRef.current);

      // Apply style update immediately (will respect throttling for inactive viewsheds)
      applySensorStyle(sensorRef.current, observationProperties, cesiumViewer, isActive);
    } catch (err) {
      // Failed to update - sensor might be destroyed
    }
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.showSensorGeometry,
    observationProperties.showViewshed,
    observationProperties.sensorColor,
    isActive,
  ]);

  // Register preview handler for live updates
  useEffect(() => {
    if (!isInitialized) return;
    initializePreviewGlobals();

    const { handler, cleanup } = createPreviewHandler({
      objectId,
      sensorRef,
      isTransitioningRef,
      propertiesRef: observationPropertiesRef,
      viewer: cesiumViewer,
    });

    window.addEventListener("cesium-observation-preview", handler);
    return () => {
      window.removeEventListener("cesium-observation-preview", handler);
      cleanup(); // Cancel any pending RAF callbacks
    };
  }, [isInitialized, objectId, cesiumViewer]);

  return null;
};

export default ViewshedAnalysis;
