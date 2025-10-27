"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import * as Cesium from "cesium";
import { updateFlags, updateColors } from "../../utils/sensors";
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
  const isCreatingRef = useRef(false); // Prevent concurrent creation
  const creatingShapeSigRef = useRef<string>(""); // Track which shape sig we're creating

  const refs: SensorRefs = {
    sensorRef,
    sensorCompositeRef: { current: null }, // Deprecated, kept for compatibility
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
    if (!isInitialized || !cesiumViewer) {
      console.log(
        "[CREATE SENSOR] Early return: initialized=",
        isInitialized,
        "viewer=",
        !!cesiumViewer
      );
      return;
    }

    // Compute shape sig FIRST to check if we should even start
    const shapeSig = computeShapeSignature(observationProperties);
    console.log("[CREATE SENSOR] Computed shape sig:", shapeSig, "last was:", lastShapeSigRef.current);

    // GUARD: Check if shape sig really changed
    if (lastShapeSigRef.current === shapeSig) {
      console.log("[CREATE SENSOR] Early return: shape sig unchanged");
      return;
    }

    // GUARD: Check if we're already creating THIS exact shape sig
    if (creatingShapeSigRef.current === shapeSig) {
      console.log("[CREATE SENSOR] Early return: already creating shape sig:", shapeSig);
      return;
    }

    // GUARD: Check if already transitioning OR creating
    if (isTransitioningRef.current || isCreatingRef.current) {
      console.log("[CREATE SENSOR] Early return: already transitioning or creating");
      return;
    }

    console.log("[CREATE SENSOR] Starting... shape sig:", shapeSig);

    // GUARD: Set flags IMMEDIATELY
    isCreatingRef.current = true;
    isTransitioningRef.current = true;
    creatingShapeSigRef.current = shapeSig; // Track which sig we're creating

    try {
      // GUARD: Update shape sig IMMEDIATELY to prevent double creation
      console.log(
        "[CREATE SENSOR] Shape sig changed:",
        lastShapeSigRef.current,
        "->",
        shapeSig
      );
      lastShapeSigRef.current = shapeSig;

      // Count primitives before cleanup
      const beforeCount = cesiumViewer?.scene?.primitives?.length;
      console.log("[CREATE SENSOR] Primitives before cleanup:", beforeCount);

      // Clean up old sensor
      if (sensorRef.current) {
        console.log("[CREATE SENSOR] Removing old sensor:", sensorRef.current);
        removeSensor(sensorRef.current, cesiumViewer);
      }
      sensorRef.current = null;

      console.log("[CREATE SENSOR] Creating new sensor...");
      const { sensor } = createSensor({
        viewer: cesiumViewer,
        position,
        rotation,
        properties: observationProperties,
      });

      sensorRef.current = sensor;

      // Count primitives after creation
      const afterCount = cesiumViewer?.scene?.primitives?.length;
      console.log("[CREATE SENSOR] Created sensor:", sensor);
      console.log("[CREATE SENSOR] Primitives after creation:", afterCount);
      console.log("[CREATE SENSOR] Sensor ref now:", sensorRef.current);
    } catch (err) {
      console.error("[CREATE SENSOR] Error creating Ion SDK sensor:", err);
      toast.error(`Failed to create sensor: ${(err as any)?.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      isCreatingRef.current = false;
      isTransitioningRef.current = false;
      creatingShapeSigRef.current = "";  // Clear the creating sig
      console.log("[CREATE SENSOR] Done, flags=false");
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
  }, [isInitialized, objectId, cesiumViewer]);

  useEffect(() => {
    if (!isInitialized) {
      console.log("[STYLE EFFECT] Early return: not initialized");
      return;
    }
    if (!sensorRef.current) {
      console.log("[STYLE EFFECT] Early return: no sensor ref");
      return;
    }

    console.log(
      "[STYLE EFFECT] Running for showSensorGeometry=",
      observationProperties.showSensorGeometry,
      "showViewshed=",
      observationProperties.showViewshed
    );

    try {
      // Count primitives before update
      const beforeCount = cesiumViewer?.scene?.primitives?.length;
      console.log("[STYLE EFFECT] Primitives before update:", beforeCount);

      // Update flags
      updateFlags(sensorRef.current, {
        show:
          !!observationProperties.showSensorGeometry ||
          !!observationProperties.showViewshed,
        showViewshed: !!observationProperties.showViewshed,
      });

      // Update colors if changed
      if (observationProperties.sensorColor) {
        const color = Cesium.Color.fromCssColorString(
          observationProperties.sensorColor
        );
        updateColors(sensorRef.current, {
          volume: color.withAlpha(0.25),
          visible: color.withAlpha(0.35),
          occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
        });
      }

      // Count primitives after update
      const afterCount = cesiumViewer?.scene?.primitives?.length;
      console.log("[STYLE EFFECT] Primitives after update:", afterCount);

      if (afterCount !== beforeCount) {
        console.warn(
          "[STYLE EFFECT] ⚠️ WARNING: Primitive count changed! before=",
          beforeCount,
          "after=",
          afterCount
        );
      }
    } catch (err) {
      console.warn("[STYLE EFFECT] Failed to update visibility flags:", err);
    }
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.showSensorGeometry,
    observationProperties.showViewshed,
    observationProperties.sensorType,
    observationProperties.sensorColor,
  ]);

  return null;
};

export default ViewshedAnalysis;
