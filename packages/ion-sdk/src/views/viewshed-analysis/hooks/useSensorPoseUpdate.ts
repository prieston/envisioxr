import { useEffect, useRef } from "react";
import type { SensorRefs, TransformConfig } from "../types";
import { buildModelMatrix } from "../utils";
import { updatePose as updateIonPose } from "../../../utils/sensors";
import { getThrottleConfig } from "../config/throttle-config";

export function useSensorPoseUpdate(
  isInitialized: boolean,
  refs: SensorRefs,
  config: TransformConfig,
  cesiumViewer: any,
  isActive: boolean = false
) {
  const lastUpdateRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<TransformConfig | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!refs.sensorRef.current && !refs.sensorCompositeRef.current) return;

    const performUpdate = () => {
      if (!refs.sensorRef.current && !refs.sensorCompositeRef.current) return;

      const updateConfig = pendingUpdateRef.current || config;
      pendingUpdateRef.current = null;

      const modelMatrix = buildModelMatrix(
        updateConfig.position,
        updateConfig.rotation,
        updateConfig.sensorForwardAxis,
        updateConfig.modelFrontAxis,
        updateConfig.tiltDeg
      );

      updateIonPose(
        refs.sensorCompositeRef.current ?? refs.sensorRef.current,
        modelMatrix
      );
      cesiumViewer?.scene?.requestRender();
      lastUpdateRef.current = Date.now();
    };

    const throttle = getThrottleConfig();

    if (isActive || !throttle.enabled) {
      // Active viewshed or throttling disabled: update immediately via RAF for smooth interaction
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      pendingUpdateRef.current = config;
      requestAnimationFrame(performUpdate);
    } else {
      // Inactive viewshed: throttle based on configuration
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      const throttleInterval = throttle.inactiveUpdateIntervalMs;

      if (timeSinceLastUpdate >= throttleInterval) {
        // Enough time has passed, update immediately
        pendingUpdateRef.current = config;
        performUpdate();
      } else {
        // Queue update for later
        pendingUpdateRef.current = config;
        const remainingTime = throttleInterval - timeSinceLastUpdate;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          performUpdate();
        }, remainingTime);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // We intentionally track individual config properties instead of the whole config object
    // to avoid unnecessary re-renders when other properties change
  }, [
    isInitialized,
    config.position,
    config.rotation,
    config.sensorForwardAxis,
    config.modelFrontAxis,
    config.tiltDeg,
    refs,
    cesiumViewer,
    isActive,
  ]);
}
