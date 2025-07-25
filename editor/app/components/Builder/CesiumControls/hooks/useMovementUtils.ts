import { useCallback } from "react";
import * as Cesium from "cesium";
import { MovementVector, SimulationParams } from "../types";
import { MOVEMENT_KEYS, ROTATION_KEYS, ANIMATION_TIMING } from "../constants";

/**
 * Hook for movement utility functions
 *
 * @param getPressedKeys - Function to get currently pressed keys
 * @returns Object containing movement calculation utilities
 */
export const useMovementUtils = (getPressedKeys: () => Set<string>) => {
  /**
   * Calculate movement direction vector from pressed keys
   */
  const calculateMovementVector = useCallback((): MovementVector => {
    const keys = getPressedKeys();
    return {
      x:
        (keys.has(MOVEMENT_KEYS.LEFT) ? -1 : 0) +
        (keys.has(MOVEMENT_KEYS.RIGHT) ? 1 : 0),
      y:
        (keys.has(MOVEMENT_KEYS.JUMP) ? 1 : 0) +
        (keys.has(MOVEMENT_KEYS.CROUCH) ? -1 : 0),
      z:
        (keys.has(MOVEMENT_KEYS.FORWARD) ? -1 : 0) +
        (keys.has(MOVEMENT_KEYS.BACKWARD) ? 1 : 0),
    };
  }, [getPressedKeys]);

  /**
   * Calculate turn vector from arrow keys
   */
  const calculateTurnVector = useCallback((): MovementVector => {
    const keys = getPressedKeys();
    return {
      x:
        (keys.has(ROTATION_KEYS.LOOK_UP) ? -1 : 0) +
        (keys.has(ROTATION_KEYS.LOOK_DOWN) ? 1 : 0),
      y:
        (keys.has(ROTATION_KEYS.LOOK_LEFT) ? -1 : 0) +
        (keys.has(ROTATION_KEYS.LOOK_RIGHT) ? 1 : 0),
      z: 0,
    };
  }, [getPressedKeys]);

  /**
   * Apply movement to camera position
   */
  const applyMovement = useCallback(
    (
      camera: Cesium.Camera,
      cesiumViewer: Cesium.Viewer,
      moveVector: MovementVector,
      speed: number,
      mode: string,
      _getGroundHeight: (
        position: Cesium.Cartesian3,
        checkSlope?: boolean
      ) => number | null,
      _params: SimulationParams
    ): void => {
      if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
        return;

      // Debug logging
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Movement] Applying movement:`,
          moveVector,
          `Speed:`,
          speed,
          `Mode:`,
          mode
        );
      }

      const direction = camera.direction;
      const up = camera.up;
      const right = camera.right;

      // Calculate move direction using Cesium math
      let moveDirection = new Cesium.Cartesian3(0, 0, 0);

      if (moveVector.z !== 0) {
        const forwardVector = Cesium.Cartesian3.multiplyByScalar(
          direction,
          moveVector.z,
          new Cesium.Cartesian3()
        );
        moveDirection = Cesium.Cartesian3.add(
          moveDirection,
          forwardVector,
          moveDirection
        );
      }

      if (moveVector.x !== 0) {
        const rightVector = Cesium.Cartesian3.multiplyByScalar(
          right,
          moveVector.x,
          new Cesium.Cartesian3()
        );
        moveDirection = Cesium.Cartesian3.add(
          moveDirection,
          rightVector,
          moveDirection
        );
      }

      if (moveVector.y !== 0) {
        const upVector = Cesium.Cartesian3.multiplyByScalar(
          up,
          moveVector.y,
          new Cesium.Cartesian3()
        );
        moveDirection = Cesium.Cartesian3.add(
          moveDirection,
          upVector,
          moveDirection
        );
      }

      if (Cesium.Cartesian3.magnitude(moveDirection) > 0) {
        // Normalize and scale by speed
        Cesium.Cartesian3.normalize(moveDirection, moveDirection);
        const scaledMovement = Cesium.Cartesian3.multiplyByScalar(
          moveDirection,
          speed * ANIMATION_TIMING.frameTime,
          new Cesium.Cartesian3()
        );

        // Calculate new position
        const newPosition = Cesium.Cartesian3.add(
          camera.position,
          scaledMovement,
          new Cesium.Cartesian3()
        );

        // Apply ground detection for walk and car modes
        if (mode === "firstPerson" || mode === "car") {
          // For now, use direct movement to test if the issue is with ground detection
          if (process.env.NODE_ENV === "development") {
            console.log(`[Movement] Using direct movement for testing`);
          }
          camera.position = newPosition;

          // TODO: Re-enable ground detection once basic movement works
          /*
          const groundHeight = getGroundHeight(newPosition, true);
          if (groundHeight !== null) {
            const cartographic =
              cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
                newPosition
              );
            if (cartographic) {
              const heightOffset =
                mode === "firstPerson" ? params.walkHeight : params.carHeight;
              cartographic.height = groundHeight + heightOffset;
              const groundPosition =
                cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(
                  cartographic
                );
              if (groundPosition) {
                camera.position = groundPosition;
              }
            }
          } else {
            // Fallback: move without ground detection
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Movement] No ground height found, using direct movement`);
            }
            camera.position = newPosition;
          }
          */
        } else {
          camera.position = newPosition;
        }

        // Debug: Log final position
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Movement] Camera position updated to:`,
            camera.position
          );
        }
      }
    },
    [getPressedKeys]
  );

  return {
    calculateMovementVector,
    calculateTurnVector,
    applyMovement,
  };
};
