import * as Cesium from "cesium";

export interface PositioningResult {
  position: [number, number, number];
  surfaceType: "3d_tiles" | "terrain" | "ellipsoid" | "none";
  accuracy: "high" | "medium" | "low";
  confidence: number;
}

export interface PositioningOptions {
  prefer3DTiles?: boolean;
  preferTerrain?: boolean;
  maxTerrainDistance?: number;
  fallbackToEllipsoid?: boolean;
}

export class CesiumPositioningUtils {
  private viewer: Cesium.Viewer;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }
  public getPositionAtScreenPoint(
    screenPosition: Cesium.Cartesian2,
    options: PositioningOptions = {}
  ): PositioningResult | null {
    const { prefer3DTiles = true, preferTerrain = true, maxTerrainDistance = 1000, fallbackToEllipsoid = true } = options;
    if (prefer3DTiles) {
      const r = this.pickFrom3DTiles(screenPosition);
      if (r) return r;
    }
    if (preferTerrain) {
      const r = this.pickFromTerrain(screenPosition, maxTerrainDistance);
      if (r) return r;
    }
    if (fallbackToEllipsoid) {
      const r = this.pickFromEllipsoid(screenPosition);
      if (r) return r;
    }
    return null;
  }
  private pickFrom3DTiles(screenPosition: Cesium.Cartesian2): PositioningResult | null {
    try {
      const { scene } = this.viewer;
      if (!scene.pickPositionSupported) return null;
      const pickedFeature = scene.pick(screenPosition);
      if (!pickedFeature) return null;
      const cartesian = scene.pickPosition(screenPosition);
      if (!cartesian) return null;
      const c = Cesium.Cartographic.fromCartesian(cartesian);
      return {
        position: [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height],
        surfaceType: "3d_tiles",
        accuracy: "high",
        confidence: 0.95,
      };
    } catch {
      return null;
    }
  }
  private pickFromTerrain(screenPosition: Cesium.Cartesian2, maxDistance = 1000): PositioningResult | null {
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
        position: [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height],
        surfaceType: "terrain",
        accuracy: "high",
        confidence: 0.9,
      };
    } catch {
      return null;
    }
  }
  private pickFromEllipsoid(screenPosition: Cesium.Cartesian2): PositioningResult | null {
    try {
      const { camera, scene } = this.viewer;
      const ellipsoid = scene.globe.ellipsoid;
      const cartesian = camera.pickEllipsoid(screenPosition, ellipsoid);
      if (!cartesian) return null;
      const c = Cesium.Cartographic.fromCartesian(cartesian);
      return {
        position: [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude), c.height],
        surfaceType: "ellipsoid",
        accuracy: "low",
        confidence: 0.6,
      };
    } catch {
      return null;
    }
  }
}

export function createPositioningUtils(viewer: Cesium.Viewer) {
  return new CesiumPositioningUtils(viewer);
}

export function getPositionAtScreenPoint(
  viewer: Cesium.Viewer,
  screenX: number,
  screenY: number,
  options?: PositioningOptions
) {
  const utils = new CesiumPositioningUtils(viewer);
  const screenPos = new Cesium.Cartesian2(screenX, screenY);
  return utils.getPositionAtScreenPoint(screenPos, options);
}


