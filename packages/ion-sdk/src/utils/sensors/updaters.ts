/**
 * Functions for updating existing sensors
 */

import * as Cesium from "cesium";
import { IonSensor, SensorComposite } from "./types";
import { createConicSensorOrComposite } from "./creators";
import { requestRender } from "./helpers";
import { PROMOTE_AT_DEG, DEMOTE_AT_DEG, MIN_RADIUS, DEBUG } from "./constants";

/**
 * Update the pose (position/rotation) of a sensor
 */
export function updatePose(
  target: IonSensor | SensorComposite,
  modelMatrix: Cesium.Matrix4,
  viewer?: any
): void {
  if ((target as SensorComposite)?.parts) {
    const comp = target as SensorComposite;
    comp.setPose(modelMatrix);
  } else {
    (target as IonSensor).modelMatrix = modelMatrix;
  }
  requestRender(viewer);
}

/**
 * Update visibility flags
 */
export function updateFlags(
  target: IonSensor | SensorComposite,
  opts: {
    show?: boolean;
    showViewshed?: boolean;
    showGeometry?: boolean;
  },
  viewer?: any
): void {
  if ((target as SensorComposite)?.parts) {
    const comp = target as SensorComposite;
    comp.setFlags(opts);
  } else {
    const s = target as IonSensor;
    if (opts.show !== undefined) s.show = opts.show;
    if (opts.showViewshed !== undefined) s.showViewshed = opts.showViewshed;
    if (opts.showGeometry !== undefined) {
      s.showLateralSurfaces = opts.showGeometry;
      s.showDomeSurfaces = opts.showGeometry;
    }
    requestRender(viewer);
  }
}

/**
 * Update sensor colors
 */
export function updateColors(
  target: IonSensor | SensorComposite,
  colors: {
    volume?: Cesium.Color;
    visible?: Cesium.Color;
    occluded?: Cesium.Color;
  },
  viewer?: any
): void {
  if ((target as SensorComposite)?.parts) {
    const comp = target as SensorComposite;
    comp.setColors(colors);
  } else {
    const s = target as IonSensor;
    if (colors.volume) {
      const mat = Cesium.Material.fromType("Color", { color: colors.volume });
      s.lateralSurfaceMaterial = mat;
      s.domeSurfaceMaterial = mat;
    }
    if (colors.visible) s.viewshedVisibleColor = colors.visible;
    if (colors.occluded) s.viewshedOccludedColor = colors.occluded;
    requestRender(viewer);
  }
}

/**
 * Update FOV and radius, handling single ⇄ composite transitions.
 * Returns a possibly-new handle when crossing the 180° threshold.
 */
export function updateFovRadiusSmart(
  handle: IonSensor | SensorComposite | null | undefined,
  opts: {
    fovDeg?: number;
    radius?: number;
    viewer: any;
    modelMatrix: Cesium.Matrix4;
    color: Cesium.Color;
    include3DModels?: boolean;
  }
): IonSensor | SensorComposite | null {
  const full =
    opts.fovDeg != null ? Cesium.Math.clamp(opts.fovDeg, 0, 360) : undefined;
  const r = opts.radius != null ? Math.max(MIN_RADIUS, opts.radius) : undefined;

  const request = () => requestRender(opts.viewer);

  // No handle: create from scratch
  if (!handle) {
    const f = full ?? 60;
    const { sensor, composite } = createConicSensorOrComposite({
      viewer: opts.viewer,
      modelMatrix: opts.modelMatrix,
      fovDeg: f,
      radius: r ?? 100,
      sensorColor: opts.color,
      include3DModels: opts.include3DModels,
    });
    const h = (composite ?? sensor)!;
    request();
    return h;
  }

  const isComposite = !!(handle as any)?.parts;

  DEBUG &&
    console.log(
      `%c[SMART] mode=${isComposite ? "composite" : "single"} fov=${full} r=${r}`,
      "color:#a855f7"
    );

  // Composite path
  if (isComposite) {
    const comp = handle as SensorComposite;

    // Check if we need to demote BEFORE updating anything
    if (full != null && full < DEMOTE_AT_DEG) {
      DEBUG && console.log("%c[DEMOTE] composite -> single", "color:#ef4444");
      const prevR = r ?? comp.parts[0]?.radius ?? 100;
      comp.destroy?.();
      const { sensor } = createConicSensorOrComposite({
        viewer: opts.viewer,
        modelMatrix: opts.modelMatrix,
        fovDeg: full,
        radius: prevR,
        sensorColor: opts.color,
        include3DModels: opts.include3DModels,
      });
      // Preserve colors and flags from composite
      updateColors(sensor, {
        volume: opts.color.withAlpha(0.25),
        visible: opts.color.withAlpha(0.35),
        occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
      });
      request();
      return sensor!;
    }

    // Update radius (only if not demoting)
    if (r != null) {
      for (let i = 0; i < comp.parts.length; i++) {
        comp.parts[i].radius = r;
      }
    }

    // Update FOV
    if (full != null && comp.updateFov) {
      comp.updateFov(full);
    }

    request();
    return comp;
  }

  // Single path
  const s = handle as IonSensor;

  // Update radius
  if (r != null) s.radius = r;

  // Check if we need to promote
  if (full != null && full > PROMOTE_AT_DEG) {
    DEBUG && console.log("%c[PROMOTE] single -> composite", "color:#ef4444");
    const prevR = r ?? s.radius ?? 100;

    if (opts.viewer?.scene?.primitives?.contains?.(s)) {
      opts.viewer.scene.primitives.remove(s);
    }
    s.destroy?.();

    const { composite } = createConicSensorOrComposite({
      viewer: opts.viewer,
      modelMatrix: opts.modelMatrix,
      fovDeg: full,
      radius: prevR,
      sensorColor: opts.color,
      include3DModels: opts.include3DModels,
    });
    // Preserve colors and flags from single
    updateColors(composite, {
      volume: opts.color.withAlpha(0.25),
      visible: opts.color.withAlpha(0.35),
      occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
    });
    request();
    return composite!;
  }

  // Update FOV (single)
  if (full != null) {
    s.outerHalfAngle = Cesium.Math.toRadians(
      Math.min(179.9, Math.max(1, full)) / 2
    );
  }

  request();
  return s;
}
