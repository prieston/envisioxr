import { useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { CarSimulationState, SimulationParams } from "../types";
import { MOVEMENT_KEYS, CAR_STEERING, ANIMATION_TIMING } from "../constants";

/**
 * Hook for car simulation logic
 *
 * @param getPressedKeys - Function to get currently pressed keys
 * @returns Object containing car simulation utilities
 */
export const useCarSimulation = (getPressedKeys: () => Set<string>) => {
  // Car simulation refs
  const carDirection = useRef(new Cesium.Cartesian3(0, 0, 1));
  const carRotation = useRef(0);

  /**
   * Handle car-specific movement with steering
   */
  const handleCarMovement = useCallback(
    (
      camera: Cesium.Camera,
      cesiumViewer: Cesium.Viewer,
      speed: number,
      getGroundHeight: (
        position: Cesium.Cartesian3,
        checkSlope?: boolean
      ) => number | null,
      params: SimulationParams
    ): void => {
      const keys = getPressedKeys();

      let isMoving = false;
      let turnAmount = 0;

      if (keys.has(MOVEMENT_KEYS.FORWARD)) {
        isMoving = true;
        if (keys.has(MOVEMENT_KEYS.LEFT)) turnAmount = CAR_STEERING.turnSpeed; // Turn left
        if (keys.has(MOVEMENT_KEYS.RIGHT)) turnAmount = -CAR_STEERING.turnSpeed; // Turn right
      } else if (keys.has(MOVEMENT_KEYS.BACKWARD)) {
        isMoving = true;
        if (keys.has(MOVEMENT_KEYS.LEFT)) turnAmount = -CAR_STEERING.turnSpeed; // Turn right (when reversing)
        if (keys.has(MOVEMENT_KEYS.RIGHT)) turnAmount = CAR_STEERING.turnSpeed; // Turn left (when reversing)
      }

      // Update car rotation
      if (turnAmount !== 0) {
        carRotation.current += turnAmount;
        carDirection.current = new Cesium.Cartesian3(
          Math.sin(carRotation.current),
          0,
          Math.cos(carRotation.current)
        );
      }

      // Move car forward/backward
      if (isMoving) {
        const moveDirection = Cesium.Cartesian3.multiplyByScalar(
          carDirection.current,
          keys.has(MOVEMENT_KEYS.BACKWARD) ? -1 : 1,
          new Cesium.Cartesian3()
        );

        const scaledMovement = Cesium.Cartesian3.multiplyByScalar(
          moveDirection,
          speed * ANIMATION_TIMING.frameTime,
          new Cesium.Cartesian3()
        );

        const newPosition = Cesium.Cartesian3.add(
          camera.position,
          scaledMovement,
          new Cesium.Cartesian3()
        );

        // Apply ground detection
        const groundHeight = getGroundHeight(newPosition, true);
        if (groundHeight !== null) {
          const cartographic =
            cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
              newPosition
            );
          if (cartographic) {
            cartographic.height = groundHeight + params.carHeight;
            const groundPosition =
              cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(
                cartographic
              );
            if (groundPosition) {
              camera.position = groundPosition;
            }
          }
        } else {
          camera.position = newPosition;
        }

        // Update camera rotation to match car direction
        camera.setView({
          destination: camera.position,
          orientation: {
            heading: carRotation.current,
            pitch: 0,
            roll: 0,
          },
        });
      }
    },
    [getPressedKeys]
  );

  /**
   * Get current car simulation state
   */
  const getCarState = useCallback((): CarSimulationState => {
    return {
      direction: carDirection.current,
      rotation: carRotation.current,
      isMoving: false, // This would need to be tracked separately
    };
  }, []);

  /**
   * Reset car simulation state
   */
  const resetCarState = useCallback(() => {
    carDirection.current = new Cesium.Cartesian3(0, 0, 1);
    carRotation.current = 0;
  }, []);

  return {
    handleCarMovement,
    getCarState,
    resetCarState,
  };
};
