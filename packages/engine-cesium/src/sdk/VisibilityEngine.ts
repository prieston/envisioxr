import * as Cesium from "cesium";
import type { AnySensor, ViewshedOptions } from "./types";
import { enuFrame, unitFromAzEl } from "./helpers";

export class VisibilityEngine {
  private viewer: Cesium.Viewer;
  private ellipsoid: Cesium.Ellipsoid;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.ellipsoid = viewer.scene.globe.ellipsoid;
  }

  async computeViewshed(sensor: AnySensor, opts: ViewshedOptions = {}) {
    const clearance = opts.clearance ?? 1.5;
    const stepCount = opts.stepCount ?? 64;

    // Angular sampling grid based on sensor type
    const azN = Math.max(8, opts.raysAzimuth ?? 120);
    const elN = Math.max(1, opts.raysElevation ?? 4);

    const origin = sensor.position;
    // Lift analysis origin above terrain + clearance
    const originCarto = Cesium.Cartographic.fromCartesian(origin);
    try {
      const sampled = await Cesium.sampleTerrainMostDetailed(
        this.viewer.terrainProvider,
        [originCarto]
      );
      if (sampled && sampled[0]) {
        const minH = Math.max(
          originCarto.height,
          (sampled[0].height ?? originCarto.height) + clearance
        );
        originCarto.height = minH;
      }
    } catch (_e) {
      // ignore
    }
    const originForAnalysis = Cesium.Cartesian3.fromRadians(
      originCarto.longitude,
      originCarto.latitude,
      originCarto.height
    );
    // Use consistent HPR frame with the cone (HPR at the sensor's position)
    const hpr = new Cesium.HeadingPitchRoll(
      sensor.heading,
      sensor.pitch,
      sensor.roll
    );
    const q = Cesium.Transforms.headingPitchRollQuaternion(
      originForAnalysis,
      hpr
    );
    const rot = Cesium.Matrix3.fromQuaternion(q);
    // Horizon occluder with fallback: prefer EllipsoidalOccluder; else use Occluder with WGS84 sphere
    const __Cesium = Cesium as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let occluder: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (__Cesium.EllipsoidalOccluder) {
      occluder = new __Cesium.EllipsoidalOccluder(
        this.ellipsoid,
        originForAnalysis
      );
    } else if (__Cesium.Occluder && Cesium.BoundingSphere) {
      const bs = Cesium.BoundingSphere.fromEllipsoid(this.ellipsoid);
      occluder = new Cesium.Occluder(bs, originForAnalysis);
    } else {
      occluder = null;
    }

    const dirs: Cesium.Cartesian3[] = [];

    const includeDir = (dLocal: Cesium.Cartesian3) => {
      switch (sensor.type) {
        case "cone": {
          // within cone if angle to +X <= fov/2
          const angle = Math.acos(
            Cesium.Cartesian3.dot(
              Cesium.Cartesian3.normalize(dLocal, new Cesium.Cartesian3()),
              new Cesium.Cartesian3(1, 0, 0)
            )
          );
          return angle <= sensor.fov * 0.5 + 1e-6;
        }
        case "rectangle": {
          const nx = Cesium.Cartesian3.normalize(
            dLocal,
            new Cesium.Cartesian3()
          );
          // project to X-Y and X-Z planes for H/V checks
          const az = Math.atan2(nx.y, nx.x); // horizontal yaw from +X
          const el = Math.asin(nx.z); // elevation from X-Y plane
          return (
            Math.abs(az) <= sensor.fovH * 0.5 + 1e-6 &&
            Math.abs(el) <= sensor.fovV * 0.5 + 1e-6
          );
        }
        case "dome": {
          const nx = Cesium.Cartesian3.normalize(
            dLocal,
            new Cesium.Cartesian3()
          );
          const angle = Math.acos(
            Cesium.Cartesian3.dot(nx, new Cesium.Cartesian3(1, 0, 0))
          );
          return angle <= sensor.maxPolar + 1e-6;
        }
        case "custom": {
          return sensor.directionFilter(dLocal);
        }
      }
    };

    // Build directions (az about +X, el about X-Y plane)
    // We scan az in [-pi, +pi] and el in a narrow band; includeDir will clip based on sensor type
    for (let i = 0; i < azN; i++) {
      const az = -Math.PI + (2 * Math.PI * i) / (azN - 1);
      for (let j = 0; j < elN; j++) {
        const el = -Math.PI / 2 + (Math.PI * j) / (elN - 1);
        const dirLocal = unitFromAzEl(az, el);
        if (!includeDir(dirLocal)) continue;
        // rotate into world
        const dirWorld = Cesium.Matrix3.multiplyByVector(
          rot,
          dirLocal,
          new Cesium.Cartesian3()
        );
        dirs.push(
          Cesium.Cartesian3.normalize(dirWorld, new Cesium.Cartesian3())
        );
      }
    }

    // For each direction, march along the ray and find the farthest visible point
    const farPoints: Cesium.Cartesian3[] = [];
    for (const dir of dirs) {
      const end = Cesium.Cartesian3.add(
        originForAnalysis,
        Cesium.Cartesian3.multiplyByScalar(
          dir,
          sensor.range,
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      );
      const p = await this._farthestVisibleAlongRay(
        originForAnalysis,
        end,
        stepCount,
        clearance,
        occluder
      );
      if (p) farPoints.push(p);
    }

    if (farPoints.length < 3) {
      return { polygonEntity: null, boundary: farPoints };
    }

    // Sort far points by angle around origin (for a clean polygon)
    const enu = enuFrame(originForAnalysis);
    const local2d: {
      ang: number;
      pLocal: Cesium.Cartesian3;
      pWorld: Cesium.Cartesian3;
    }[] = [];
    for (const p of farPoints) {
      const pL = (() => {
        const __inv = Cesium.Matrix4.inverseTransformation(
          enu,
          new Cesium.Matrix4()
        );
        return Cesium.Matrix4.multiplyByPoint(
          __inv,
          p,
          new Cesium.Cartesian3()
        );
      })();
      const ang = Math.atan2(pL.y, pL.x);
      local2d.push({ ang, pLocal: pL, pWorld: p });
    }
    local2d.sort((a, b) => a.ang - b.ang);

    const hierarchyPositions = local2d.map((o) => o.pWorld);

    const collection = opts.collection ?? this.viewer.entities;
    const polygonEntity = collection.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(hierarchyPositions),
        material: opts.material ?? Cesium.Color.DODGERBLUE.withAlpha(0.25),
        outline: opts.outline ?? true,
        outlineColor: opts.outlineColor ?? Cesium.Color.YELLOW,
        perPositionHeight: false,
        // Remove classificationType to prevent rendering conflicts with GLB models
        // classificationType: Cesium.ClassificationType.TERRAIN,
        // Add proper depth testing to prevent hiding GLB models
        extrudedHeight: 0,
        height: 0,
        // Ensure polygon doesn't interfere with model rendering
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          Number.MAX_VALUE
        ),
      },
    });

    return { polygonEntity, boundary: hierarchyPositions };
  }

  private async _farthestVisibleAlongRay(
    start: Cesium.Cartesian3,
    end: Cesium.Cartesian3,
    steps: number,
    clearance: number,
    occluder: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Cesium.Cartesian3 | null> {
    // Pre-build sample points along straight segment
    const ptsCarto: Cesium.Cartographic[] = [];
    const ptsWorld: Cesium.Cartesian3[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = Cesium.Cartesian3.lerp(start, end, t, new Cesium.Cartesian3());
      // quick reject if occluded by globe
      if (occluder && !occluder.isPointVisible(p)) break;
      ptsWorld.push(p);
      ptsCarto.push(Cesium.Cartographic.fromCartesian(p));
    }

    if (ptsCarto.length === 0) return null;

    // Batch terrain sampling once
    const sampled = await Cesium.sampleTerrainMostDetailed(
      this.viewer.terrainProvider,
      ptsCarto
    );

    // Find farthest sample that remains above terrain + clearance
    let lastVisible: Cesium.Cartesian3 | null = null;
    for (let i = 0; i < sampled.length; i++) {
      const pCarto = sampled[i];
      const pWorld = ptsWorld[i];

      // Expected straight-line height at this sample is the z of pWorld
      // But ECEF z is not height. Rebuild the linearly-interpolated point in ECEF already done (pWorld),
      // get terrain height at that lon/lat, compare with geodetic height of pWorld.
      const worldCarto = Cesium.Cartographic.fromCartesian(pWorld);
      const lineHeight = worldCarto.height; // height above ellipsoid along our straight segment
      const terrainHeight = pCarto.height;

      if (lineHeight < terrainHeight + clearance) break; // occluded here
      lastVisible = pWorld;
    }

    return lastVisible;
  }
}

