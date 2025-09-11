/*
  Cesium Mini Visibility SDK (TypeScript)
  --------------------------------------
  Drop-in utilities for Next.js + CesiumJS to cover:
   - Transform editor (translate, rotate-yaw, uniform scale) with a 3‑axis gizmo
   - Sensor geometries (cone, rectangle, dome, custom) + visualization
   - CPU-accelerated (batched) line-of-sight + viewshed polygon over terrain

  Notes
  - This is NOT the Cesium ion SDK. It’s open code you can paste into your app.
  - GPU viewshed via post-process depth is not exposed as a stable public API in CesiumJS;
    this module focuses on fast CPU ray-batching with terrain sampling.
  - All math is done in an East‑North‑Up (ENU) local frame. Forward is +X in local sensor space.
  - Requires CesiumJS >= 1.105 (adjust types if you’re on an older version).

  Usage (sketch)
  --------------
  import {TransformEditor, Sensors, VisibilityEngine} from "./mini-visibility-sdk";

  // In a client-only component after you create a Viewer
  const gizmo = new TransformEditor(viewer, {
    onChange: (trs) => {
      // update an entity/model with trs.modelMatrix
    }
  });
  gizmo.attachToEntity(entity);

  // Create a cone sensor
  const cone = Sensors.createCone(viewer, {
    id: "sensor-1",
    position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    heading: 0, pitch: 0, roll: 0,
    fov: Cesium.Math.toRadians(50), // full aperture
    range: 2500,
    color: Cesium.Color.LIME.withAlpha(0.25)
  });

  // Compute viewshed (returns a clamped-to-ground polygon entity)
  const engine = new VisibilityEngine(viewer);
  const result = await engine.computeViewshed({
    type: "cone",
    position: cone.position,
    hpr: new Cesium.HeadingPitchRoll(cone.heading, cone.pitch, cone.roll),
    range: 2500,
    fovH: Cesium.Math.toRadians(50),
    fovV: Cesium.Math.toRadians(50),
  }, { raysAzimuth: 180, raysElevation: 5, clearance: 2.0, material: Cesium.Color.DODGERBLUE.withAlpha(0.2) });

*/

import * as Cesium from "cesium";

// --------------------------
// Types & helpers
// --------------------------
export type SensorType = "cone" | "rectangle" | "dome" | "custom";

export interface SensorBase {
  id?: string;
  position: Cesium.Cartesian3; // apex / origin in ECEF
  heading: number; // rad
  pitch: number; // rad
  roll: number; // rad
  range: number; // meters
  color?: Cesium.Color;
  collection?: Cesium.EntityCollection;
}

export interface ConeSensor extends SensorBase {
  fov: number; // full aperture in radians (e.g., 50° -> 0.87266)
}

export interface RectSensor extends SensorBase {
  fovH: number; // horizontal full aperture in radians
  fovV: number; // vertical full aperture in radians
}

export interface DomeSensor extends SensorBase {
  maxPolar: number; // polar angle from forward (0..pi), e.g., 120° dome
}

export type CustomDirectionFilter = (dirLocal: Cesium.Cartesian3) => boolean; // local +X forward

export interface CustomSensor extends SensorBase {
  directionFilter: CustomDirectionFilter; // returns true if ray is inside sensor geometry
}

export type AnySensor =
  | ({ type: "cone" } & ConeSensor)
  | ({ type: "rectangle" } & RectSensor)
  | ({ type: "dome" } & DomeSensor)
  | ({ type: "custom" } & CustomSensor);

export interface ViewshedOptions {
  raysAzimuth?: number; // number of azimuth samples (around forward axis); default 120
  raysElevation?: number; // elevation slices within aperture; default 4
  clearance?: number; // meters above terrain to consider clear; default 1.5
  stepCount?: number; // samples per ray; default 64
  material?: Cesium.Color | Cesium.MaterialProperty; // polygon fill material
  outline?: boolean; // draw outline; default true
  outlineColor?: Cesium.Color; // default Color.YELLOW
  clampToGround?: boolean; // default true
  collection?: Cesium.EntityCollection;
}

function hprRotation(h: number, p: number, r: number): Cesium.Matrix3 {
  const q = Cesium.Quaternion.fromHeadingPitchRoll(
    new Cesium.HeadingPitchRoll(h, p, r)
  );
  return Cesium.Matrix3.fromQuaternion(q);
}

function enuFrame(origin: Cesium.Cartesian3): Cesium.Matrix4 {
  return Cesium.Transforms.eastNorthUpToFixedFrame(origin);
}

function worldFromLocal(
  origin: Cesium.Cartesian3,
  vLocal: Cesium.Cartesian3,
  rot: Cesium.Matrix3
): Cesium.Cartesian3 {
  const vRot = Cesium.Matrix3.multiplyByVector(
    rot,
    vLocal,
    new Cesium.Cartesian3()
  );
  return Cesium.Cartesian3.add(origin, vRot, new Cesium.Cartesian3());
}

function unitFromAzEl(az: number, el: number): Cesium.Cartesian3 {
  // local frame: +X forward, +Y left, +Z up
  const cosEl = Math.cos(el);
  return new Cesium.Cartesian3(
    Math.cos(az) * cosEl, // X
    Math.sin(az) * cosEl, // Y
    Math.sin(el) // Z
  );
}

// --------------------------
// Sensors: geometry + visualization entities
// --------------------------
export const Sensors = {
  createCone(viewer: Cesium.Viewer, cfg: ConeSensor) {
    const id = cfg.id ?? `cone-${Date.now()}`;
    const baseRadius = cfg.range * Math.tan(cfg.fov * 0.5);

    // 1) Build HPR relative to the CONE position, not the camera
    const hpr = new Cesium.HeadingPitchRoll(cfg.heading, cfg.pitch, cfg.roll);
    const qHPR = Cesium.Transforms.headingPitchRollQuaternion(
      cfg.position,
      hpr
    );
    // Align cone's +Z axis to engine's +X forward (rotate -90° around +Y)
    const qAlign = Cesium.Quaternion.fromAxisAngle(
      Cesium.Cartesian3.UNIT_Y,
      -Math.PI / 2
    );
    const q = Cesium.Quaternion.multiply(qHPR, qAlign, new Cesium.Quaternion());

    // 2) Get a world rotation matrix from that quaternion
    const rot = Cesium.Matrix3.fromQuaternion(q);

    // 3) The cylinder's axis is +Z. Offset the CENTER so the apex (top) sits at cfg.position
    const forwardWorld = Cesium.Matrix3.multiplyByVector(
      rot,
      Cesium.Cartesian3.UNIT_Z,
      new Cesium.Cartesian3()
    );
    const conePos = Cesium.Cartesian3.add(
      cfg.position,
      Cesium.Cartesian3.multiplyByScalar(
        forwardWorld,
        -cfg.range * 0.5,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );

    // 4) Use the SAME quaternion for the entity's orientation
    // Make properties explicitly constant to prevent React re-renders from coercing them
    const orientation = new Cesium.ConstantProperty(q);
    const position = new Cesium.ConstantPositionProperty(conePos);

    const collection = cfg.collection ?? viewer.entities;
    const entity = collection.add({
      id,
      position,
      orientation,
      cylinder: {
        length: cfg.range,
        topRadius: 0, // Tip at the top
        bottomRadius: baseRadius, // Base at the bottom
        material: cfg.color ?? Cesium.Color.LIME.withAlpha(0.25),
        outline: true,
        outlineColor: (cfg.color ?? Cesium.Color.LIME).withAlpha(0.9),
        numberOfVerticalLines: 24,
      },
    });

    return {
      id,
      entity,
      position: cfg.position,
      heading: cfg.heading,
      pitch: cfg.pitch,
      roll: cfg.roll,
      range: cfg.range,
      fov: cfg.fov,
    };
  },

  createRectangle(viewer: Cesium.Viewer, cfg: RectSensor) {
    const id = cfg.id ?? `rect-${Date.now()}`;
    // Visualize as a frustum-like box using a polyline outline
    const rot = hprRotation(cfg.heading, cfg.pitch, cfg.roll);
    const halfH = Math.tan(cfg.fovH * 0.5) * cfg.range;
    const halfV = Math.tan(cfg.fovV * 0.5) * cfg.range;
    const cornersLocal = [
      new Cesium.Cartesian3(cfg.range, -halfH, -halfV),
      new Cesium.Cartesian3(cfg.range, halfH, -halfV),
      new Cesium.Cartesian3(cfg.range, halfH, halfV),
      new Cesium.Cartesian3(cfg.range, -halfH, halfV),
    ];
    const cornersWorld = cornersLocal.map((c) =>
      worldFromLocal(cfg.position, c, rot)
    );
    const positions = [cfg.position, ...cornersWorld, cfg.position];

    const collection = cfg.collection ?? viewer.entities;
    const entity = collection.add({
      id,
      polyline: {
        positions,
        width: 2,
        material: cfg.color ?? Cesium.Color.ORANGE,
      },
    });
    return { id, entity, ...cfg };
  },

  createDome(viewer: Cesium.Viewer, cfg: DomeSensor) {
    const id = cfg.id ?? `dome-${Date.now()}`;
    const rot = hprRotation(cfg.heading, cfg.pitch, cfg.roll);
    const steps = 36;
    const ring: Cesium.Cartesian3[] = [];
    const el = cfg.maxPolar; // polar from forward
    const r = Math.tan(el) * cfg.range;
    for (let i = 0; i < steps; i++) {
      const az = (i / steps) * Math.PI * 2;
      const local = new Cesium.Cartesian3(
        cfg.range,
        Math.cos(az) * r,
        Math.sin(az) * r
      );
      ring.push(worldFromLocal(cfg.position, local, rot));
    }
    const collection = cfg.collection ?? viewer.entities;
    const entity = collection.add({
      id,
      polyline: {
        positions: [...ring, ring[0]],
        width: 2,
        material: cfg.color ?? Cesium.Color.CYAN,
      },
    });
    return { id, entity, ...cfg };
  },
};

// --------------------------
// Visibility engine (CPU, batched terrain sampling)
// --------------------------
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

// --------------------------
// Transform editor (gizmo)
//  - Modes: translate (XY plane), rotate (about Up), scale (uniform)
//  - Keep it simple & robust; you can extend axes/planes per need
// --------------------------
export type GizmoMode = "translate" | "rotate" | "scale";

export interface TransformEditorOptions {
  axisLength?: number; // meters, visual size
  gizmoPosition?: "center" | "top"; // where to position the gizmo relative to the entity
  onChange?: (trs: {
    position: Cesium.Cartesian3;
    rotation: Cesium.Quaternion;
    scale: number;
    modelMatrix: Cesium.Matrix4;
  }) => void;
  collection?: Cesium.EntityCollection;
}

export class TransformEditor {
  private viewer: Cesium.Viewer;
  private opts: TransformEditorOptions;
  private mode: GizmoMode = "translate";
  private axesEntity: Cesium.Entity | null = null;
  private targetEntity: Cesium.Entity | null = null;
  private handler: Cesium.ScreenSpaceEventHandler | null = null;
  private scale = 1.0;
  private rotation = Cesium.Quaternion.IDENTITY;
  private collection: Cesium.EntityCollection;

  constructor(viewer: Cesium.Viewer, opts: TransformEditorOptions = {}) {
    this.viewer = viewer;
    this.opts = opts;
    this.collection = opts.collection ?? viewer.entities;
  }

  setMode(m: GizmoMode) {
    this.mode = m;
    this._refreshGizmo();
  }

  attachToEntity(entity: Cesium.Entity) {
    this.targetEntity = entity;
    if (!entity.position) throw new Error("Target entity must have position");
    this._refreshGizmo();
    this._bindEvents();
  }

  detach() {
    if (this.axesEntity) this.collection.remove(this.axesEntity);
    this.axesEntity = null;
    this.targetEntity = null;
    if (this.handler) this.handler.destroy();
    this.handler = null;
  }

  private _refreshGizmo() {
    if (!this.targetEntity) return;
    if (this.axesEntity) this.collection.remove(this.axesEntity);

    const pos = this._getTargetPosition();
    const len = this.opts.axisLength ?? 5.0;

    const xEnd = Cesium.Cartesian3.add(
      pos,
      new Cesium.Cartesian3(len, 0, 0),
      new Cesium.Cartesian3()
    );
    const yEnd = Cesium.Cartesian3.add(
      pos,
      new Cesium.Cartesian3(0, len, 0),
      new Cesium.Cartesian3()
    );
    const zEnd = Cesium.Cartesian3.add(
      pos,
      new Cesium.Cartesian3(0, 0, len),
      new Cesium.Cartesian3()
    );

    this.axesEntity = this.collection.add({
      polyline: {
        positions: [pos, xEnd, pos, yEnd, pos, zEnd],
        width: 20, // Even thicker for easier selection
        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE),
        clampToGround: false,
      },
      point: {
        pixelSize: 24, // Much larger center point
        color: Cesium.Color.YELLOW, // More visible color
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 4,
        // Add depth testing to ensure visibility
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: this.mode.toUpperCase(),
        pixelOffset: new Cesium.Cartesian2(0, -30),
        scale: 0.8, // Larger text
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
        // Add depth testing to ensure visibility
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  }

  private _bindEvents() {
    if (this.handler) this.handler.destroy();
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    let dragging = false;
    let startWorld: Cesium.Cartesian3 | null = null;

    const pickPlane = () => {
      // Plane through target in ENU X-Y (Up = ellipsoid normal)
      const pos = this._getTargetPosition();
      const normal = Cesium.Cartesian3.normalize(
        this.ellipsoidSurfaceNormal(pos),
        new Cesium.Cartesian3()
      );
      return new Cesium.Plane(normal, -Cesium.Cartesian3.dot(normal, pos));
    };

    this.handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        dragging = true;
        const ray = this.viewer.camera.getPickRay(movement.position);
        if (!ray) return;
        startWorld = this.intersectRayWithPlane(ray, pickPlane());
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN
    );

    this.handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (!dragging || !this.targetEntity) return;
        const ray = this.viewer.camera.getPickRay(movement.endPosition);
        if (!ray) return;
        const now = this.intersectRayWithPlane(ray, pickPlane());
        if (!now || !startWorld) return;

        const delta = Cesium.Cartesian3.subtract(
          now,
          startWorld,
          new Cesium.Cartesian3()
        );

        if (this.mode === "translate") {
          // update position
          const curr = this._getTargetPosition();
          const next = Cesium.Cartesian3.add(
            curr,
            delta,
            new Cesium.Cartesian3()
          );
          this._setTargetPosition(next);
        } else if (this.mode === "rotate") {
          // yaw: angle around Up vector
          const enu = enuFrame(this._getTargetPosition());
          const localPrev = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              startWorld,
              new Cesium.Cartesian3()
            );
          })();
          const localNow = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              now,
              new Cesium.Cartesian3()
            );
          })();
          const a0 = Math.atan2(localPrev.y, localPrev.x);
          const a1 = Math.atan2(localNow.y, localNow.x);
          const dYaw = a1 - a0;
          const q = Cesium.Quaternion.fromAxisAngle(
            Cesium.Cartesian3.UNIT_Z,
            dYaw
          );
          // apply rotation to the entity orientation if present
          const currQ = this.targetEntity.orientation?.getValue(
            new Cesium.JulianDate()
          ) as Cesium.Quaternion | undefined;
          const nextQ = currQ
            ? Cesium.Quaternion.multiply(q, currQ, new Cesium.Quaternion())
            : q;
          this.targetEntity.orientation = new Cesium.ConstantProperty(nextQ);
        } else if (this.mode === "scale") {
          // uniform scale based on radial distance change
          const enu = enuFrame(this._getTargetPosition());
          const localPrev = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              startWorld,
              new Cesium.Cartesian3()
            );
          })();
          const localNow = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              now,
              new Cesium.Cartesian3()
            );
          })();
          const s0 = Math.hypot(localPrev.x, localPrev.y);
          const s1 = Math.hypot(localNow.x, localNow.y);
          const k = s1 / Math.max(1e-3, s0);
          this.scale *= k;
          // If target is a Model entity with a model.scale property
          if (this.targetEntity.model && "scale" in this.targetEntity.model) {
            (this.targetEntity.model as any).scale = this.scale; // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        }

        startWorld = now;
        this._refreshGizmo();
        this._emitChange();
        // Force re-render to show changes immediately
        this.viewer.scene.requestRender();
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    this.handler.setInputAction(() => {
      dragging = false;
      startWorld = null;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  private _getTargetPosition(): Cesium.Cartesian3 {
    if (!this.targetEntity) throw new Error("No target");
    const time = Cesium.JulianDate.now();
    const p = this.targetEntity.position?.getValue(time);
    if (!p) throw new Error("Target must have position");

    // If gizmo should be positioned at the top of the cone
    if (this.opts.gizmoPosition === "top" && this.targetEntity.cylinder) {
      const cylinder = this.targetEntity.cylinder;
      const length = cylinder.length?.getValue(time) || 0;
      const orientation = this.targetEntity.orientation?.getValue(time);

      if (orientation) {
        // Calculate the forward direction (cone's +Z axis)
        const forward = Cesium.Matrix3.multiplyByVector(
          Cesium.Matrix3.fromQuaternion(orientation),
          Cesium.Cartesian3.UNIT_Z,
          new Cesium.Cartesian3()
        );

        // Move from center to top (apex) of the cone
        const topPosition = Cesium.Cartesian3.add(
          p,
          Cesium.Cartesian3.multiplyByScalar(
            forward,
            length * 0.5, // Half the length to reach the top
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );

        return topPosition;
      }
    }

    return p.clone();
  }

  private _setTargetPosition(p: Cesium.Cartesian3) {
    if (!this.targetEntity) return;

    // If gizmo is at the top of the cone, convert the position back to cone center
    if (this.opts.gizmoPosition === "top" && this.targetEntity.cylinder) {
      const time = Cesium.JulianDate.now();
      const cylinder = this.targetEntity.cylinder;
      const length = cylinder.length?.getValue(time) || 0;
      const orientation = this.targetEntity.orientation?.getValue(time);

      if (orientation) {
        // Calculate the forward direction (cone's +Z axis)
        const forward = Cesium.Matrix3.multiplyByVector(
          Cesium.Matrix3.fromQuaternion(orientation),
          Cesium.Cartesian3.UNIT_Z,
          new Cesium.Cartesian3()
        );

        // Move from apex to center (subtract half the length)
        const centerPosition = Cesium.Cartesian3.subtract(
          p,
          Cesium.Cartesian3.multiplyByScalar(
            forward,
            length * 0.5,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );

        this.targetEntity.position = new Cesium.ConstantPositionProperty(
          centerPosition
        );
        return;
      }
    }

    this.targetEntity.position = new Cesium.ConstantPositionProperty(p);
  }

  private _emitChange() {
    if (!this.opts.onChange || !this.targetEntity) return;
    const pos = this._getTargetPosition();
    const rot =
      (this.targetEntity.orientation?.getValue(
        Cesium.JulianDate.now()
      ) as Cesium.Quaternion) || Cesium.Quaternion.IDENTITY;
    const k = this.scale;
    const m = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
      pos,
      rot,
      new Cesium.Cartesian3(k, k, k)
    );

    // eslint-disable-next-line no-console
    console.log(
      `[TransformEditor] Emitting change: position=${pos}, rotation=${rot}, scale=${k}`
    );

    this.opts.onChange({
      position: pos,
      rotation: rot,
      scale: k,
      modelMatrix: m,
    });
  }

  private ellipsoidSurfaceNormal(p: Cesium.Cartesian3): Cesium.Cartesian3 {
    return this.viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
      p,
      new Cesium.Cartesian3()
    );
  }

  private intersectRayWithPlane(
    ray: Cesium.Ray,
    plane: Cesium.Plane
  ): Cesium.Cartesian3 | null {
    return Cesium.IntersectionTests.rayPlane(ray, plane);
  }
}

export default { Sensors, VisibilityEngine, TransformEditor };
