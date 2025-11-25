import { useCallback } from "react";
import * as Cesium from "cesium";
import { GroundDetectionResult } from "../types";
import { createLogger } from "@klorad/core";

/**
 * Hook for ground detection and terrain interaction
 *
 * @param cesiumViewer - The Cesium viewer instance
 * @returns Object containing ground detection utilities
 */
export const useGroundDetection = (cesiumViewer: Cesium.Viewer | null) => {
  const logger = createLogger("GroundDetection");
  /**
   * Enhanced ground detection function with slope checking
   *
   * @param position - The position to check ground height at
   * @param checkSlope - Whether to check for steep slopes
   * @returns Ground height or null if detection fails
   */
  const getGroundHeight = useCallback(
    (
      position: Cesium.Cartesian3,
      checkSlope: boolean = false
    ): number | null => {
      if (!cesiumViewer) return null;

      try {
        const cartographic =
          cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(position);
        if (!cartographic) return null;

        // Get terrain height at this position
        const terrainHeight = cesiumViewer.scene.globe.getHeight(cartographic);
        if (terrainHeight === undefined || terrainHeight === null) {
          // Fallback to ellipsoid height if terrain is not available
          logger.debug(
            `No terrain height, using cartographic height: ${cartographic.height}`
          );
          return cartographic.height;
        }

        // If slope checking is enabled, check if the slope is too steep
        if (checkSlope) {
          const currentCartographic =
            cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
              cesiumViewer.camera.position
            );
          if (currentCartographic) {
            const currentHeight =
              cesiumViewer.scene.globe.getHeight(currentCartographic) ||
              currentCartographic.height;
            const heightDifference = Math.abs(terrainHeight - currentHeight);
            const distance = Cesium.Cartesian3.distance(
              position,
              cesiumViewer.camera.position
            );

            if (distance > 0) {
              const slope = Math.atan(heightDifference / distance);
              if (slope > 0.5) {
                // 30 degrees max slope
                // Slope is too steep, return current height to prevent movement
                logger.debug(
                  `Slope too steep: ${((slope * 180) / Math.PI).toFixed(1)}° (max: 30.0°)`
                );
                return currentHeight;
              }
            }
          }
        }

        return terrainHeight;
      } catch (error) {
        logger.warn("Error getting ground height:", error as unknown as Error);
        return null;
      }
    },
    [cesiumViewer]
  );

  /**
   * Get current ground height for display purposes
   */
  const getCurrentGroundHeight = useCallback((): number | null => {
    if (!cesiumViewer) return null;
    return getGroundHeight(cesiumViewer.camera.position);
  }, [cesiumViewer, getGroundHeight]);

  /**
   * Get detailed ground detection result
   */
  const getGroundDetectionResult = useCallback(
    (
      position: Cesium.Cartesian3,
      checkSlope: boolean = false
    ): GroundDetectionResult => {
      const height = getGroundHeight(position, checkSlope);
      return {
        height: height || 0,
        isValid: height !== null,
      };
    },
    [getGroundHeight]
  );

  return {
    getGroundHeight,
    getCurrentGroundHeight,
    getGroundDetectionResult,
  };
};
