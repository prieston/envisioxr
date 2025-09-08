import * as Cesium from "cesium";

export interface PositioningResult {
  position: [number, number, number]; // [longitude, latitude, height]
  surfaceType: "3d_tiles" | "terrain" | "ellipsoid" | "none";
  accuracy: "high" | "medium" | "low";
  confidence: number; // 0-1
}

export interface PositioningOptions {
  prefer3DTiles?: boolean;
  preferTerrain?: boolean;
  maxTerrainDistance?: number;
  fallbackToEllipsoid?: boolean;
}

/**
 * Advanced positioning utility for Cesium that provides multiple picking strategies
 * for accurate model placement on different surface types.
 */
export class CesiumPositioningUtils {
  private viewer: Cesium.Viewer;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * Get the most accurate position at the given screen coordinates
   */
  public getPositionAtScreenPoint(
    screenPosition: Cesium.Cartesian2,
    options: PositioningOptions = {}
  ): PositioningResult | null {
    const {
      prefer3DTiles = true,
      preferTerrain = true,
      maxTerrainDistance = 1000,
      fallbackToEllipsoid = true,
    } = options;

    // Method 1: Try to pick from 3D tiles (most accurate for buildings/structures)
    if (prefer3DTiles) {
      const tilesResult = this.pickFrom3DTiles(screenPosition);
      if (tilesResult) {
        return tilesResult;
      }
    }

    // Method 2: Try to pick from terrain (accurate for ground placement)
    if (preferTerrain) {
      const terrainResult = this.pickFromTerrain(
        screenPosition,
        maxTerrainDistance
      );
      if (terrainResult) {
        return terrainResult;
      }
    }

    // Method 3: Fallback to ellipsoid intersection
    if (fallbackToEllipsoid) {
      const ellipsoidResult = this.pickFromEllipsoid(screenPosition);
      if (ellipsoidResult) {
        return ellipsoidResult;
      }
    }

    return null;
  }

  /**
   * Pick position from 3D tiles (buildings, structures, etc.)
   */
  private pickFrom3DTiles(
    screenPosition: Cesium.Cartesian2
  ): PositioningResult | null {
    try {
      const pickedPosition = this.viewer.scene.pickPosition(screenPosition);
      if (pickedPosition) {
        const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        return {
          position: [longitude, latitude, height],
          surfaceType: "3d_tiles",
          accuracy: "high",
          confidence: 0.95,
        };
      }
    } catch (error) {
      console.warn("Error picking from 3D tiles:", error);
    }
    return null;
  }

  /**
   * Pick position from terrain using ray casting
   */
  private pickFromTerrain(
    screenPosition: Cesium.Cartesian2,
    maxDistance: number = 1000
  ): PositioningResult | null {
    try {
      const ray = this.viewer.camera.getPickRay(screenPosition);
      if (!ray) return null;

      const terrainProvider = this.viewer.terrainProvider;

      // Check if we have terrain data available
      if (terrainProvider && terrainProvider.availability) {
        // Use terrain ray casting for accurate ground positioning
        const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;

          // Check if the picked position is within reasonable distance
          const cameraPosition = this.viewer.camera.position;
          const distance = Cesium.Cartesian3.distance(
            cartesian,
            cameraPosition
          );

          if (distance <= maxDistance) {
            return {
              position: [longitude, latitude, height],
              surfaceType: "terrain",
              accuracy: "high",
              confidence: 0.9,
            };
          }
        }
      }

      // Fallback: use ellipsoid intersection with ray
      const ellipsoid = this.viewer.scene.globe.ellipsoid;
      const intersection = Cesium.IntersectionTests.rayEllipsoid(
        ray,
        ellipsoid
      );
      if (intersection) {
        const scaledDirection = Cesium.Cartesian3.multiplyByScalar(
          ray.direction,
          intersection.start,
          new Cesium.Cartesian3()
        );
        const cartesian = Cesium.Cartesian3.add(
          ray.origin,
          scaledDirection,
          new Cesium.Cartesian3()
        );
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        return {
          position: [longitude, latitude, height],
          surfaceType: "terrain",
          accuracy: "medium",
          confidence: 0.8,
        };
      }
    } catch (error) {
      console.warn("Error picking from terrain:", error);
    }
    return null;
  }

  /**
   * Pick position from ellipsoid (fallback method)
   */
  private pickFromEllipsoid(
    screenPosition: Cesium.Cartesian2
  ): PositioningResult | null {
    try {
      const ray = this.viewer.camera.getPickRay(screenPosition);
      if (!ray) return null;

      const ellipsoid = this.viewer.scene.globe.ellipsoid;
      const intersection = Cesium.IntersectionTests.rayEllipsoid(
        ray,
        ellipsoid
      );

      if (intersection) {
        const scaledDirection = Cesium.Cartesian3.multiplyByScalar(
          ray.direction,
          intersection.start,
          new Cesium.Cartesian3()
        );
        const cartesian = Cesium.Cartesian3.add(
          ray.origin,
          scaledDirection,
          new Cesium.Cartesian3()
        );
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        return {
          position: [longitude, latitude, height],
          surfaceType: "ellipsoid",
          accuracy: "low",
          confidence: 0.6,
        };
      }
    } catch (error) {
      console.warn("Error picking from ellipsoid:", error);
    }
    return null;
  }

  /**
   * Get terrain height at a specific geographic position
   */
  public async getTerrainHeight(
    longitude: number,
    latitude: number
  ): Promise<number> {
    try {
      const terrainProvider = this.viewer.terrainProvider;
      if (!terrainProvider || !terrainProvider.availability) {
        return 0;
      }

      const positions = [Cesium.Cartographic.fromDegrees(longitude, latitude)];
      const updatedPositions = await Cesium.sampleTerrainMostDetailed(
        terrainProvider,
        positions
      );

      if (updatedPositions.length > 0) {
        return updatedPositions[0].height;
      }
    } catch (error) {
      console.warn("Error getting terrain height:", error);
    }
    return 0;
  }

  /**
   * Check if a position is on a 3D tile surface
   */
  public isOn3DTiles(
    longitude: number,
    latitude: number,
    height: number
  ): boolean {
    try {
      const cartesian = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      const screenPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
        this.viewer.scene,
        cartesian
      );

      if (screenPosition) {
        const pickedPosition = this.viewer.scene.pickPosition(screenPosition);
        if (pickedPosition) {
          const distance = Cesium.Cartesian3.distance(
            cartesian,
            pickedPosition
          );
          return distance < 10; // Within 10 meters
        }
      }
    } catch (error) {
      console.warn("Error checking 3D tiles position:", error);
    }
    return false;
  }

  /**
   * Get the best positioning strategy for the current view
   */
  public getOptimalPositioningStrategy(): PositioningOptions {
    const camera = this.viewer.camera;
    const height = camera.positionCartographic.height;

    // If camera is close to ground, prefer terrain
    if (height < 1000) {
      return {
        preferTerrain: true,
        prefer3DTiles: true,
        maxTerrainDistance: 500,
        fallbackToEllipsoid: true,
      };
    }

    // If camera is at medium height, prefer 3D tiles
    if (height < 10000) {
      return {
        prefer3DTiles: true,
        preferTerrain: true,
        maxTerrainDistance: 1000,
        fallbackToEllipsoid: true,
      };
    }

    // If camera is high up, use ellipsoid as fallback
    return {
      prefer3DTiles: false,
      preferTerrain: false,
      fallbackToEllipsoid: true,
    };
  }

  /**
   * Get positioning options optimized for different surface types
   */
  public getPositioningOptionsForSurfaceType(
    surfaceType: "ground" | "building" | "mixed" | "auto"
  ): PositioningOptions {
    switch (surfaceType) {
      case "ground":
        return {
          preferTerrain: true,
          prefer3DTiles: false,
          maxTerrainDistance: 2000,
          fallbackToEllipsoid: true,
        };
      case "building":
        return {
          prefer3DTiles: true,
          preferTerrain: false,
          maxTerrainDistance: 100,
          fallbackToEllipsoid: true,
        };
      case "mixed":
        return {
          prefer3DTiles: true,
          preferTerrain: true,
          maxTerrainDistance: 1000,
          fallbackToEllipsoid: true,
        };
      case "auto":
      default:
        return this.getOptimalPositioningStrategy();
    }
  }
}

/**
 * Utility function to create a positioning instance
 */
export function createPositioningUtils(
  viewer: Cesium.Viewer
): CesiumPositioningUtils {
  return new CesiumPositioningUtils(viewer);
}

/**
 * Simple positioning function for backward compatibility
 * Now handles both screen coordinates and canvas-relative coordinates
 */
export function getPositionAtScreenPoint(
  viewer: Cesium.Viewer,
  screenX: number,
  screenY: number,
  options?: PositioningOptions
): PositioningResult | null {
  const positioningUtils = new CesiumPositioningUtils(viewer);

  // Check if these are canvas-relative coordinates (smaller than screen size)
  // or screen coordinates (larger values)
  const isCanvasRelative = screenX < 2000 && screenY < 2000; // Heuristic check

  let screenPosition: Cesium.Cartesian2;

  if (isCanvasRelative) {
    // Convert canvas-relative coordinates to screen coordinates
    const canvas = viewer.canvas;
    const rect = canvas.getBoundingClientRect();
    const screenX_absolute = screenX + rect.left;
    const screenY_absolute = screenY + rect.top;
    screenPosition = new Cesium.Cartesian2(screenX_absolute, screenY_absolute);
  } else {
    // Already screen coordinates
    screenPosition = new Cesium.Cartesian2(screenX, screenY);
  }

  return positioningUtils.getPositionAtScreenPoint(screenPosition, options);
}
