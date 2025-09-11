import * as Cesium from "cesium";

export interface PositioningResult {
  position: [number, number, number]; // [longitude, latitude, height]
  surfaceType: "3d_tiles" | "terrain" | "ellipsoid" | "none";
  accuracy: "high" | "medium" | "low";
  confidence: number; // 0–1
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

    if (prefer3DTiles) {
      const tilesResult = this.pickFrom3DTiles(screenPosition);
      if (tilesResult) return tilesResult;
    }

    if (preferTerrain) {
      const terrainResult = this.pickFromTerrain(
        screenPosition,
        maxTerrainDistance
      );
      if (terrainResult) return terrainResult;
    }

    if (fallbackToEllipsoid) {
      const ellipsoidResult = this.pickFromEllipsoid(screenPosition);
      if (ellipsoidResult) return ellipsoidResult;
    }

    return null;
  }

  /** Pick position from 3D Tiles (buildings, structures, etc.) */
  private pickFrom3DTiles(
    screenPosition: Cesium.Cartesian2
  ): PositioningResult | null {
    try {
      const { scene } = this.viewer;
      if (!scene.pickPositionSupported) return null;

      const pickedFeature = scene.pick(screenPosition);
      if (!pickedFeature) return null;

      const cartesian = scene.pickPosition(screenPosition);
      if (!cartesian) return null;

      const c = Cesium.Cartographic.fromCartesian(cartesian);
      return {
        position: [
          Cesium.Math.toDegrees(c.longitude),
          Cesium.Math.toDegrees(c.latitude),
          c.height,
        ],
        surfaceType: "3d_tiles",
        accuracy: "high",
        confidence: 0.95,
      };
    } catch (err) {
      console.warn("Error picking from 3D tiles:", err);
      return null;
    }
  }

  /** Pick position from terrain using globe raycast */
  private pickFromTerrain(
    screenPosition: Cesium.Cartesian2,
    maxDistance = 1000
  ): PositioningResult | null {
    try {
      const { camera, scene } = this.viewer;
      const globe = scene.globe;

      const ray = camera.getPickRay(screenPosition);
      if (!ray) return null;

      const cartesian = globe.pick(ray, scene);
      if (!cartesian) return null;

      const distance = Cesium.Cartesian3.distance(cartesian, camera.position);
      const effectiveMax = Math.max(maxDistance, distance * 0.1);
      if (distance > effectiveMax) return null;

      const c = Cesium.Cartographic.fromCartesian(cartesian);
      return {
        position: [
          Cesium.Math.toDegrees(c.longitude),
          Cesium.Math.toDegrees(c.latitude),
          c.height,
        ],
        surfaceType: "terrain",
        accuracy: "high",
        confidence: 0.9,
      };
    } catch (err) {
      console.warn("Error picking from terrain:", err);
      return null;
    }
  }

  /** Pick position from ellipsoid (fallback) */
  private pickFromEllipsoid(
    screenPosition: Cesium.Cartesian2
  ): PositioningResult | null {
    try {
      const { camera, scene } = this.viewer;
      const ellipsoid = scene.globe.ellipsoid;

      const cartesian = camera.pickEllipsoid(screenPosition, ellipsoid);
      if (!cartesian) return null;

      const c = Cesium.Cartographic.fromCartesian(cartesian);
      return {
        position: [
          Cesium.Math.toDegrees(c.longitude),
          Cesium.Math.toDegrees(c.latitude),
          c.height,
        ],
        surfaceType: "ellipsoid",
        accuracy: "low",
        confidence: 0.6,
      };
    } catch (err) {
      console.warn("Error picking from ellipsoid:", err);
      return null;
    }
  }

  /** Get terrain height at lon/lat */
  public async getTerrainHeight(
    longitude: number,
    latitude: number
  ): Promise<number> {
    try {
      const tp = this.viewer.terrainProvider;
      if (!tp) return 0;

      const positions = [Cesium.Cartographic.fromDegrees(longitude, latitude)];
      const updated = await Cesium.sampleTerrainMostDetailed(tp, positions);
      return updated[0]?.height ?? 0;
    } catch (err) {
      console.warn("Error getting terrain height:", err);
      return 0;
    }
  }

  /** Check if a position is on 3D Tiles */
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
      const screen = Cesium.SceneTransforms.worldToWindowCoordinates(
        this.viewer.scene,
        cartesian
      );
      if (!screen) return false;

      const picked = this.viewer.scene.pick(screen);
      return !!(
        picked &&
        (picked.tileset || picked.content || picked.primitive)
      );
    } catch (err) {
      console.warn("Error checking 3D tiles position:", err);
      return false;
    }
  }

  /** Auto strategy scaling with camera height */
  public getOptimalPositioningStrategy(): PositioningOptions {
    const height = this.viewer.camera.positionCartographic.height;
    return {
      preferTerrain: true,
      prefer3DTiles: true,
      maxTerrainDistance: Math.max(2000, height * 0.5),
      fallbackToEllipsoid: true,
    };
  }

  /** Get positioning options by surface type */
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

export function createPositioningUtils(
  viewer: Cesium.Viewer
): CesiumPositioningUtils {
  return new CesiumPositioningUtils(viewer);
}

/** Simple backward-compat helper: expects window coords */
export function getPositionAtScreenPoint(
  viewer: Cesium.Viewer,
  screenX: number,
  screenY: number,
  options?: PositioningOptions
): PositioningResult | null {
  const utils = new CesiumPositioningUtils(viewer);
  const screenPos = new Cesium.Cartesian2(screenX, screenY); // window coords
  return utils.getPositionAtScreenPoint(screenPos, options);
}
