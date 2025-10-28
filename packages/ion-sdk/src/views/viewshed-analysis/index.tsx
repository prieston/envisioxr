"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
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

// Debug flag - set to true to enable verbose logging
const DEBUG = false;

const ViewshedAnalysis: React.FC<ViewshedAnalysisProps> = ({
  position,
  rotation,
  observationProperties,
  objectId,
  cesiumViewer: providedViewer,
}) => {
  const cesiumViewer = providedViewer || (window as any).cesiumViewer;
  const isInitialized = useIonSDKInitialization(cesiumViewer);

  console.log(
    `🔵 [RENDER] objectId=${objectId}, isInitialized=${isInitialized}, hasViewer=${!!cesiumViewer}`
  );

  const sensorRef = useRef<any>(null);
  const viewshedRef = useRef<any>(null);
  const lastShapeSigRef = useRef<string>("");
  const mountedRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const isCreatingRef = useRef(false); // Prevent concurrent creation
  const creatingShapeSigRef = useRef<string>(""); // Track which shape sig we're creating

  // Compute shape sig once at top level
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

  // Memoize refs object to prevent useSensorCleanup from re-running
  const refs: SensorRefs = useMemo(
    () => ({
      sensorRef,
      sensorCompositeRef: { current: null }, // Deprecated, kept for compatibility
      viewshedRef,
    }),
    []
  );

  useEffect(() => {
    console.log(`🟢 [MOUNT] Component mounted for objectId=${objectId}`);
    return () => {
      console.log(`🔴 [UNMOUNT] Component unmounting for objectId=${objectId}`);
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
    if (!isInitialized || !cesiumViewer) {
      DEBUG &&
        console.log(
          "[CREATE SENSOR] Early return: initialized=",
          isInitialized,
          "viewer=",
          !!cesiumViewer
        );
      return;
    }

    // Use the memoized shape sig from top level
    const shapeSig = currentShapeSig;
    DEBUG &&
      console.log(
        "[CREATE SENSOR] Using memoized shape sig:",
        shapeSig,
        "creatingShapeSig=",
        creatingShapeSigRef.current,
        "isCreating=",
        isCreatingRef.current,
        "hasSensor=",
        !!sensorRef.current
      );

    // Check if someone else is already creating this exact sig
    if (creatingShapeSigRef.current === shapeSig) {
      DEBUG &&
        console.log(
          "[CREATE SENSOR] Early return: already creating exact sig:",
          shapeSig
        );
      return;
    }

    // Check if we already have a sensor (another Strict Mode call may have just created it)
    if (sensorRef.current && lastShapeSigRef.current === shapeSig) {
      DEBUG &&
        console.log(
          "[CREATE SENSOR] Early return: sensor already exists with correct sig"
        );
      return;
    }

    // If someone is creating a different sig, wait or bail
    if (creatingShapeSigRef.current !== "") {
      DEBUG &&
        console.log(
          "[CREATE SENSOR] Early return: creating different sig:",
          creatingShapeSigRef.current
        );
      return;
    }

    // GUARD: Check if shape sig really changed
    if (lastShapeSigRef.current === shapeSig) {
      DEBUG && console.log("[CREATE SENSOR] Early return: shape sig unchanged");
      return;
    }

    // Try to claim the lock for this shape sig
    creatingShapeSigRef.current = shapeSig;
    DEBUG && console.log("[CREATE SENSOR] Claimed lock for sig:", shapeSig);

    // GUARD: Check if already transitioning OR creating
    if (isTransitioningRef.current || isCreatingRef.current) {
      DEBUG &&
        console.log(
          "[CREATE SENSOR] Early return: already transitioning or creating"
        );
      creatingShapeSigRef.current = ""; // Release lock
      return;
    }

    DEBUG && console.log("[CREATE SENSOR] Starting... shape sig:", shapeSig);

    // Update shape sig FIRST to prevent race condition with concurrent calls
    const oldSig = lastShapeSigRef.current;
    lastShapeSigRef.current = shapeSig;
    DEBUG &&
      console.log(
        "[CREATE SENSOR] Updated lastShapeSigRef:",
        oldSig,
        "->",
        shapeSig
      );

    // GUARD: Set flags IMMEDIATELY
    isCreatingRef.current = true;
    isTransitioningRef.current = true;

    let created = false;
    try {
      const beforeCount = cesiumViewer?.scene?.primitives?.length ?? 0;

      // Clean up old sensor
      if (sensorRef.current) {
        console.log(
          `🧹 [CLEANUP ATTEMPT] Trying to remove sensor from ref, primitives: ${beforeCount}`
        );
        DEBUG &&
          console.log(
            "[CREATE SENSOR] Removing old sensor:",
            sensorRef.current
          );
        removeSensor(sensorRef.current, cesiumViewer);
        const afterRemove = cesiumViewer?.scene?.primitives?.length ?? 0;
        console.log(
          `🧹 [CLEANUP RESULT] After removeSensor(), primitives: ${beforeCount} → ${afterRemove}`
        );
      } else {
        console.log(
          `✨ [NO CLEANUP] sensorRef.current is null, primitives: ${beforeCount}`
        );
      }
      sensorRef.current = null;

      const afterCleanup = cesiumViewer?.scene?.primitives?.length ?? 0;
      console.log(`🔨 [CREATE] Starting creation, primitives: ${afterCleanup}`);

      DEBUG && console.log("[CREATE SENSOR] Creating new sensor...");
      const { sensor } = createSensor({
        viewer: cesiumViewer,
        position,
        rotation,
        properties: observationProperties,
      });

      sensorRef.current = sensor;
      created = true;

      const afterCreate = cesiumViewer?.scene?.primitives?.length ?? 0;
      console.log(
        `✅ [CREATE] Created sensor, primitives: ${afterCleanup} → ${afterCreate} (added ${afterCreate - afterCleanup})`
      );

      DEBUG && console.log("[CREATE SENSOR] Created sensor:", sensor);
      DEBUG &&
        console.log("[CREATE SENSOR] Sensor ref now:", sensorRef.current);
    } catch (err) {
      console.error("[CREATE SENSOR] Error creating Ion SDK sensor:", err);
      toast.error(`Failed to create sensor: ${(err as any)?.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      // If creation failed, restore previous shape signature so future attempts are not blocked
      if (!created) {
        lastShapeSigRef.current = oldSig;
      }
      isCreatingRef.current = false;
      isTransitioningRef.current = false;
      creatingShapeSigRef.current = ""; // Clear the creating sig
      DEBUG && console.log("[CREATE SENSOR] Done, flags=false");
    }
  }, [isInitialized, cesiumViewer, currentShapeSig]);

  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [isInitialized, createIonSDKSensor]);

  // NOTE: FOV and radius updates are handled by the preview handler above
  // This effect should NOT run on fov/visibilityRadius changes to avoid duplicate handling

  // Use ref to avoid recreating handler on every observationProperties change
  const observationPropertiesRef = useRef(observationProperties);
  useEffect(() => {
    observationPropertiesRef.current = observationProperties;
  }, [observationProperties]);

  useEffect(() => {
    if (!isInitialized) return;
    console.log(
      `🎧 [LISTENER] Registering preview handler for objectId=${objectId}`
    );
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
      console.log(
        `🔇 [LISTENER] Removing preview handler for objectId=${objectId}`
      );
      window.removeEventListener("cesium-observation-preview", handlePreview);
    };
  }, [isInitialized, objectId, cesiumViewer]);

  // NOTE: All property updates are now handled via the UI's schedulePreview + handlePropertyChange
  // The preview handler receives events from the UI panel and applies them.
  // We don't need a store sync effect here because:
  // 1. During drag: UI dispatches preview events via schedulePreview (live updates)
  // 2. On commit: UI calls handlePropertyChange which updates store
  // 3. The store update doesn't need to dispatch back to preview - it's already applied live

  return null;
};

export default ViewshedAnalysis;
