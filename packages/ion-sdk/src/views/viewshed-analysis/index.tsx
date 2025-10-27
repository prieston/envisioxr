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

// Generate unique instance IDs for debugging
let instanceCounter = 0;

const ViewshedAnalysis: React.FC<ViewshedAnalysisProps> = ({
  position,
  rotation,
  observationProperties,
  objectId,
  cesiumViewer: providedViewer,
}) => {
  const cesiumViewer = providedViewer || (window as any).cesiumViewer;
  const isInitialized = useIonSDKInitialization(cesiumViewer);

  const instanceIdRef = useRef(++instanceCounter);
  const sensorRef = useRef<any>(null);
  const viewshedRef = useRef<any>(null);
  const lastShapeSigRef = useRef<string>("");
  const mountedRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const isCreatingRef = useRef(false); // Prevent concurrent creation
  const creatingShapeSigRef = useRef<string>(""); // Track which shape sig we're creating

  // CRITICAL: Always log component renders
  if (instanceIdRef.current <= 2) {
    console.warn(
      `🔵 [VIEWSHED #${instanceIdRef.current}] RENDER objectId=${objectId}`
    );
  }

  DEBUG &&
    console.log(
      `[VIEWSHED #${instanceIdRef.current}] Render for objectId=${objectId}`
    );

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

  const refs: SensorRefs = {
    sensorRef,
    sensorCompositeRef: { current: null }, // Deprecated, kept for compatibility
    viewshedRef,
  };

  useEffect(() => {
    // CRITICAL: Log component mount
    console.warn(
      `🟣 [VIEWSHED #${instanceIdRef.current}] MOUNTED objectId=${objectId}`
    );
    return () => {
      mountedRef.current = false;
      // CRITICAL: Log component unmount
      console.warn(
        `⚫ [VIEWSHED #${instanceIdRef.current}] UNMOUNTED objectId=${objectId}`
      );
    };
  }, [objectId, instanceIdRef]);

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
        `[CREATE SENSOR #${instanceIdRef.current}] Using memoized shape sig:`,
        shapeSig,
        "creatingShapeSig=",
        creatingShapeSigRef.current,
        "isCreating=",
        isCreatingRef.current,
        "hasSensor=",
        !!sensorRef.current
      );

    // CRITICAL: In React Strict Mode, both calls see the same initial state.
    // The first call to claim the lock wins. The second should see it and bail.

    // Check if someone else is already creating this exact sig
    if (creatingShapeSigRef.current === shapeSig) {
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Early return: already creating exact sig:`,
          shapeSig
        );
      return;
    }

    // Check if we already have a sensor (another Strict Mode call may have just created it)
    if (sensorRef.current && lastShapeSigRef.current === shapeSig) {
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Early return: sensor already exists with correct sig`
        );
      return;
    }

    // If someone is creating a different sig, wait or bail
    if (creatingShapeSigRef.current !== "") {
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Early return: creating different sig:`,
          creatingShapeSigRef.current
        );
      return;
    }

    // GUARD: Check if shape sig really changed
    if (lastShapeSigRef.current === shapeSig) {
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Early return: shape sig unchanged`
        );
      return;
    }

    // Try to claim the lock for this shape sig
    creatingShapeSigRef.current = shapeSig;
    DEBUG &&
      console.log(
        `[CREATE SENSOR #${instanceIdRef.current}] Claimed lock for sig:`,
        shapeSig
      );

    // GUARD: Check if already transitioning OR creating
    if (isTransitioningRef.current || isCreatingRef.current) {
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Early return: already transitioning or creating`
        );
      creatingShapeSigRef.current = ""; // Release lock
      return;
    }

    DEBUG &&
      console.log(
        `[CREATE SENSOR #${instanceIdRef.current}] Starting... shape sig:`,
        shapeSig
      );

    // CRITICAL: Update shape sig FIRST to prevent race condition with concurrent calls
    const oldSig = lastShapeSigRef.current;
    lastShapeSigRef.current = shapeSig;
    DEBUG &&
      console.log(
        `[CREATE SENSOR #${instanceIdRef.current}] Updated lastShapeSigRef:`,
        oldSig,
        "->",
        shapeSig
      );

    // GUARD: Set flags IMMEDIATELY
    isCreatingRef.current = true;
    isTransitioningRef.current = true;

    try {
      // Count primitives before cleanup
      const beforeCount = cesiumViewer?.scene?.primitives?.length;
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Primitives before cleanup:`,
          beforeCount
        );

      // Clean up old sensor
      if (sensorRef.current) {
        DEBUG &&
          console.log(
            `[CREATE SENSOR #${instanceIdRef.current}] Removing old sensor:`,
            sensorRef.current
          );
        removeSensor(sensorRef.current, cesiumViewer);
      }
      sensorRef.current = null;

      // CRITICAL: Always log sensor creation
      console.warn(
        `🔴 [SENSOR CREATE #${instanceIdRef.current}] objectId=${objectId} primitives: ${beforeCount} → creating...`
      );

      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Creating new sensor...`
        );
      const { sensor } = createSensor({
        viewer: cesiumViewer,
        position,
        rotation,
        properties: observationProperties,
      });

      sensorRef.current = sensor;

      // Count primitives after creation
      const afterCount = cesiumViewer?.scene?.primitives?.length;
      
      // CRITICAL: Always log primitive count after creation
      console.warn(
        `🟢 [SENSOR CREATED #${instanceIdRef.current}] objectId=${objectId} primitives: ${beforeCount} → ${afterCount} (added ${afterCount - beforeCount})`
      );
      
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Created sensor:`,
          sensor
        );
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Primitives after creation:`,
          afterCount
        );
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Sensor ref now:`,
          sensorRef.current
        );
    } catch (err) {
      console.error(
        `[CREATE SENSOR #${instanceIdRef.current}] Error creating Ion SDK sensor:`,
        err
      );
      toast.error(`Failed to create sensor: ${(err as any)?.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      isCreatingRef.current = false;
      isTransitioningRef.current = false;
      creatingShapeSigRef.current = ""; // Clear the creating sig
      DEBUG &&
        console.log(
          `[CREATE SENSOR #${instanceIdRef.current}] Done, flags=false`
        );
    }
  }, [isInitialized, cesiumViewer, currentShapeSig]);

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
      DEBUG && console.log("[STYLE EFFECT] Early return: not initialized");
      return;
    }
    if (!sensorRef.current) {
      DEBUG && console.log("[STYLE EFFECT] Early return: no sensor ref");
      return;
    }

    DEBUG &&
      console.log(
        "[STYLE EFFECT] Running for showSensorGeometry=",
        observationProperties.showSensorGeometry,
        "showViewshed=",
        observationProperties.showViewshed
      );

    try {
      // Count primitives before update
      const beforeCount = cesiumViewer?.scene?.primitives?.length;
      DEBUG &&
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
      DEBUG &&
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
