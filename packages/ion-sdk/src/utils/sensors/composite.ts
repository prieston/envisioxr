/**
 * Composite sensor builder for wide FOV (>180°)
 * Splits a conic sensor into multiple wedges around the sensor's local +Z,
 * using the incoming pose as the source of truth (no extra face-forward remap).
 */

import * as Cesium from "cesium";
import * as IonSensors from "../../vendor/cesium-ion-sdk/ion-sdk-sensors";
import { SensorComposite, IonSensor, SensorColors, SensorFlags } from "./types";
import { partsForFull, requestRender, safeRemovePrimitive } from "./helpers";
import { MIN_RADIUS } from "./constants";

// ========= Scratch =========
const _tmpYawRot = new Cesium.Matrix4();
const _combined = new Cesium.Matrix4();

export type BuildOpts = {
  viewer: Cesium.Viewer;
  poseMatrix: Cesium.Matrix4; // ENU/ECEF model matrix from your builder
  fullDeg: number; // 0..360
  radius: number; // meters
  volumeColor?: Cesium.Color; // material color (alpha supported)
  visibleColor?: Cesium.Color; // viewshed visible
  occludedColor?: Cesium.Color; // viewshed occluded
  show?: boolean;
  showViewshed?: boolean;
  showGeometry?: boolean; // lateral + dome
};

export function buildCompositeConicSensor(opts: BuildOpts): SensorComposite {
  const {
    viewer,
    poseMatrix,
    fullDeg,
    radius: radiusRaw,
    volumeColor,
    visibleColor,
    occludedColor,
    show = true,
    showViewshed = true,
    showGeometry = false,
  } = opts;

  const scene = viewer.scene;
  const radius = Math.max(MIN_RADIUS, radiusRaw);
  const parts: IonSensor[] = [];

  // Get the proper partitioning plan for a contiguous arc
  const plan = partsForFull(fullDeg);
  const widths = plan.widths;

  if (widths.length === 0) {
    return {
      parts: [],
      setPose: () => {},
      setFlags: () => {},
      setColors: () => {},
      updateFov: () => {},
      destroy: () => {},
    };
  }

  // Center the whole arc on the sensor's forward axis (+Z after pose)
  const yawStart = -fullDeg / 2;
  let acc = 0;

  // Shared material for volume geometry (used by setColors)
  let volumeMat: Cesium.Material | undefined;
  if (volumeColor) {
    volumeMat = Cesium.Material.fromType("Color", { color: volumeColor });
  }

  // Build each wedge sequentially across a contiguous sector
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    const half = Cesium.Math.toRadians(w / 2);

    // Center of this slice = start + accumulated + half of its own width
    const yawCenterDeg = yawStart + acc + w / 2;
    acc += w;

    const modelMatrix = composeYawOnPose(poseMatrix, yawCenterDeg);

    const sensor = new (IonSensors as any).ConicSensor({
      outerHalfAngle: half,
      radius,
      show,
      showViewshed,
      showLateralSurfaces: !!showGeometry,
      showDomeSurfaces: !!showGeometry,
      showEllipsoidSurfaces: false,
      showEllipsoidHorizonSurfaces: false,
      showThroughEllipsoid: false,
      environmentConstraint: true,
      modelMatrix,
    } as any);

    // Apply volume material if provided
    if (volumeMat) {
      sensor.lateralSurfaceMaterial = volumeMat;
      sensor.domeSurfaceMaterial = volumeMat;
    }

    // Apply viewshed colors to EACH part so it doesn't default to white
    if (visibleColor) sensor.viewshedVisibleColor = visibleColor;
    if (occludedColor) sensor.viewshedOccludedColor = occludedColor;

    scene.primitives.add(sensor);
    parts.push(sensor);
  }

  requestRender(viewer);

  // ----- API -----
  // Track current FOV, plan, and pose for dynamic updates
  let currentFull = fullDeg;
  let currentPlan = plan;
  let currentPose = poseMatrix;

  const setPose = (newPose: Cesium.Matrix4) => {
    currentPose = newPose;
    const yawStart = -currentFull / 2;
    let acc = 0;
    for (let i = 0; i < parts.length; i++) {
      const w = currentPlan.widths[i];
      const yawCenterDeg = yawStart + acc + w / 2;
      acc += w;
      parts[i].modelMatrix = composeYawOnPose(newPose, yawCenterDeg);
    }
    // Only request render once after all updates
    requestRender(viewer);
  };

  const setFlags = (f: SensorFlags = {}) => {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (f.show !== undefined) p.show = f.show;
      if (f.showViewshed !== undefined) p.showViewshed = f.showViewshed;
      if (f.showGeometry !== undefined) {
        p.showLateralSurfaces = !!f.showGeometry;
        p.showDomeSurfaces = !!f.showGeometry;
      }
    }
    requestRender(viewer);
  };

  const setColors = (c: SensorColors = {}) => {
    if (c.volume) {
      if (!volumeMat) {
        volumeMat = Cesium.Material.fromType("Color", { color: c.volume });
      } else {
        (volumeMat as any).uniforms.color = c.volume;
      }
    }
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (c.volume) {
        p.lateralSurfaceMaterial = volumeMat!;
        p.domeSurfaceMaterial = volumeMat!;
      }
      if (c.visible) p.viewshedVisibleColor = c.visible;
      if (c.occluded) p.viewshedOccludedColor = c.occluded;
    }
    requestRender(viewer);
  };

  const updateFov = (newFullDeg: number) => {
    if (!Number.isFinite(newFullDeg)) return;

    const newPlan = partsForFull(newFullDeg);
    if (newPlan.widths.length !== parts.length) {
      // Different part count → rebuild from scratch
      // Remove old parts
      for (const p of parts) safeRemovePrimitive(viewer, p, true);
      parts.length = 0;

      const rebuilt = buildCompositeConicSensor({
        viewer,
        poseMatrix: currentPose,
        fullDeg: newFullDeg,
        radius,
        volumeColor,
        visibleColor,
        occludedColor,
        show,
        showViewshed,
        showGeometry,
      });

      // Copy rebuilt methods to current composite
      Object.assign(composite, rebuilt);
      requestRender(viewer);
      return;
    }

    // Same count → re-center contiguously with new widths
    currentFull = newFullDeg;
    currentPlan = newPlan;

    const yawStart = -newFullDeg / 2;
    let acc = 0;
    for (let i = 0; i < parts.length; i++) {
      const w = newPlan.widths[i];
      const half = Cesium.Math.toRadians(w / 2);
      const yawCenterDeg = yawStart + acc + w / 2;
      acc += w;

      const p = parts[i];
      p.outerHalfAngle = half;
      p.modelMatrix = composeYawOnPose(currentPose, yawCenterDeg);
    }
    requestRender(viewer);
  };

  const destroy = () => {
    // remove parts safely
    for (const p of parts) safeRemovePrimitive(viewer, p, true);
    parts.length = 0;
    requestRender(viewer);
  };

  const composite: SensorComposite = {
    parts,
    setPose,
    setFlags,
    setColors,
    updateFov,
    destroy,
  };

  return composite;
}

/**
 * Compose a local yaw about the sensor's +Z in the SAME local basis as poseMatrix.
 * We do NOT apply any extra fixed "face-forward" remap here.
 */
function composeYawOnPose(
  pose: Cesium.Matrix4,
  yawDeg: number
): Cesium.Matrix4 {
  Cesium.Matrix4.fromRotationTranslation(
    Cesium.Matrix3.fromQuaternion(
      Cesium.Quaternion.fromAxisAngle(
        Cesium.Cartesian3.UNIT_Z,
        Cesium.Math.toRadians(yawDeg)
      )
    ),
    Cesium.Cartesian3.ZERO,
    _tmpYawRot
  );
  return Cesium.Matrix4.multiplyTransformation(pose, _tmpYawRot, _combined);
}
