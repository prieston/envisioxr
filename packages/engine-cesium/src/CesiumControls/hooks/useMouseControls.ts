import { useCallback } from "react";
import * as Cesium from "cesium";
import { MOUSE_SENSITIVITY } from "../constants";
import { createLogger } from "@envisio/core";

/**
 * Hook for managing mouse movement in first-person mode
 *
 * @param cesiumViewer - The Cesium viewer instance
 * @param sensitivity - Mouse sensitivity level (optional)
 * @returns Object containing mouse control utilities
 */
export const useMouseControls = (
  cesiumViewer: Cesium.Viewer | null,
  sensitivity: number = MOUSE_SENSITIVITY.DEFAULT
) => {
  const logger = createLogger("MouseControls");
  /**
   * Handle mouse movement for first-person look
   */
  const handleMouseMove = useCallback(
    (_event: MouseEvent) => {
      if (!cesiumViewer) return;

      // This would need to be connected to the simulation state
      // For now, we'll implement it in the main component
    },
    [cesiumViewer]
  );

  /**
   * Handle first-person mouse movement with camera rotation
   */
  const handleFirstPersonMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!cesiumViewer) return;

      const camera = cesiumViewer.camera;

      // Debug logging
      logger.debug(`[Mouse] Movement: ${event.movementX}, ${event.movementY}`);

      // Calculate rotation angles
      const yawDelta = -event.movementX * sensitivity;
      const pitchDelta = -event.movementY * sensitivity;

      // Get current camera orientation
      const position = camera.position;
      const direction = camera.direction;

      // Calculate current yaw and pitch
      const currentYaw = Math.atan2(direction.y, direction.x);
      const currentPitch = Math.asin(direction.z);

      // Apply yaw rotation (left/right)
      const newYaw = currentYaw + yawDelta;

      // Apply pitch rotation (up/down) with clamping
      const newPitch = Math.max(
        -Math.PI / 2 + 0.1, // Look up limit (almost 90 degrees)
        Math.min(Math.PI / 2 - 0.1, currentPitch + pitchDelta) // Look down limit
      );

      // Calculate new direction vector
      const newDirection = new Cesium.Cartesian3(
        Math.cos(newPitch) * Math.cos(newYaw),
        Math.cos(newPitch) * Math.sin(newYaw),
        Math.sin(newPitch)
      );

      // Keep the up vector always pointing up (parallel to ground)
      const worldUp = new Cesium.Cartesian3(0, 0, 1);

      // Set camera orientation with fixed up vector
      camera.setView({
        destination: position,
        orientation: {
          direction: newDirection,
          up: worldUp,
        },
      });

      // Debug logging
      logger.debug(
        `[Mouse] Camera updated - Yaw: ${((newYaw * 180) / Math.PI).toFixed(1)}°, Pitch: ${((newPitch * 180) / Math.PI).toFixed(1)}°`
      );
    },
    [cesiumViewer, sensitivity]
  );

  /**
   * Handle pointer lock changes
   */
  const handlePointerLockChange = useCallback(() => {
    if (document.pointerLockElement) {
      logger.debug("[CesiumViewModeControls] Pointer locked");
    } else {
      logger.debug("[CesiumViewModeControls] Pointer unlocked");
    }
  }, []);

  return {
    handleMouseMove,
    handleFirstPersonMouseMove,
    handlePointerLockChange,
  };
};
