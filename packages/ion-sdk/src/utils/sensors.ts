import * as Cesium from "cesium";
import { ConicSensor, RectangularSensor } from "@cesiumgs/ion-sdk-sensors";

export type IonSensor = any;

export type SensorComposite = {
  parts: IonSensor[];
  setPose: (modelMatrix: Cesium.Matrix4) => void;
  setFlags: (opts: {
    show?: boolean;
    showViewshed?: boolean;
    showGeometry?: boolean;
  }) => void;
  setColors: (opts: {
    volume?: Cesium.Color;
    visible?: Cesium.Color;
    occluded?: Cesium.Color;
  }) => void;
};

function buildCompositeConicSensor(opts: {
  viewer: any;
  baseModelMatrix: Cesium.Matrix4;
  desiredFullFovDeg: number; // 0..360
  radius: number;
  volumeColor: Cesium.Color;
  viewshedVisible: Cesium.Color;
  viewshedOccluded: Cesium.Color;
  include3DModels?: boolean;
}): SensorComposite {
  const {
    viewer,
    baseModelMatrix,
    desiredFullFovDeg,
    radius,
    volumeColor,
    viewshedVisible,
    viewshedOccluded,
    include3DModels,
  } = opts;

  const full = Math.max(0, Math.min(360, desiredFullFovDeg));
  if (full === 0) {
    return {
      parts: [],
      setPose: () => {},
      setFlags: () => {},
      setColors: () => {},
    };
  }

  // Decide number of parts so each part ≤ 179.9°
  const maxPart = 179.9;
  const numParts = Math.max(2, Math.ceil(full / maxPart));
  const partFull = Math.min(maxPart, full / numParts);
  const partHalfRad = Cesium.Math.toRadians(partFull / 2);

  // Scale alpha per part so the union doesn't look over-bright
  const perPartAlpha = Math.max(
    0.06,
    volumeColor.alpha / Math.max(1, numParts)
  );
  const volumeColorPerPart = new Cesium.Color(
    volumeColor.red,
    volumeColor.green,
    volumeColor.blue,
    perPartAlpha
  );

  const parts: IonSensor[] = [];
  for (let i = 0; i < numParts; i++) {
    // Center axes across [-full/2, +full/2]
    const yawCenterDeg = -full / 2 + (i + 0.5) * partFull;
    const localRot = Cesium.Matrix3.fromQuaternion(
      Cesium.Quaternion.fromAxisAngle(
        new Cesium.Cartesian3(0, 0, 1),
        Cesium.Math.toRadians(yawCenterDeg)
      )
    );
    const localMM = Cesium.Matrix4.fromRotationTranslation(
      localRot,
      Cesium.Cartesian3.ZERO
    );
    const modelMatrix = Cesium.Matrix4.multiply(
      baseModelMatrix,
      localMM,
      new Cesium.Matrix4()
    );

    const volumeMat = Cesium.Material.fromType("Color", {
      color: volumeColorPerPart,
    });
    const part = new ConicSensor({
      modelMatrix,
      radius,
      outerHalfAngle: partHalfRad,
      lateralSurfaceMaterial: volumeMat,
      domeSurfaceMaterial: volumeMat,
      showLateralSurfaces: true,
      showDomeSurfaces: true,
      showViewshed: true,
      showEllipsoidSurfaces: false,
      showEllipsoidHorizonSurfaces: false,
      showThroughEllipsoid: false,
      environmentConstraint: true,
      include3DModels: include3DModels !== false,
    } as any);
    part.viewshedVisibleColor = new Cesium.Color(
      viewshedVisible.red,
      viewshedVisible.green,
      viewshedVisible.blue,
      Math.max(0.06, viewshedVisible.alpha / Math.max(1, numParts))
    );
    part.viewshedOccludedColor = viewshedOccluded;
    viewer.scene.primitives.add(part);
    parts.push(part);
  }

  const setPose = (modelMatrix: Cesium.Matrix4) => {
    for (let i = 0; i < parts.length; i++) {
      const yawCenterDeg = -full / 2 + (i + 0.5) * partFull;
      const localRot = Cesium.Matrix3.fromQuaternion(
        Cesium.Quaternion.fromAxisAngle(
          new Cesium.Cartesian3(0, 0, 1),
          Cesium.Math.toRadians(yawCenterDeg)
        )
      );
      const localMM = Cesium.Matrix4.fromRotationTranslation(
        localRot,
        Cesium.Cartesian3.ZERO
      );
      parts[i].modelMatrix = Cesium.Matrix4.multiply(
        modelMatrix,
        localMM,
        new Cesium.Matrix4()
      );
    }
  };

  const setFlags = (f: {
    show?: boolean;
    showViewshed?: boolean;
    showGeometry?: boolean;
  }) => {
    parts.forEach((p) => {
      if (f.show !== undefined) p.show = f.show;
      if (f.showViewshed !== undefined) p.showViewshed = f.showViewshed;
      if (f.showGeometry !== undefined) {
        p.showLateralSurfaces = f.showGeometry;
        p.showDomeSurfaces = f.showGeometry;
      }
    });
  };

  const setColors = (c: {
    volume?: Cesium.Color;
    visible?: Cesium.Color;
    occluded?: Cesium.Color;
  }) => {
    parts.forEach((p) => {
      if (c.volume) {
        const scaled = c.volume.withAlpha(
          Math.max(0.06, c.volume.alpha / Math.max(1, parts.length))
        );
        const mat = Cesium.Material.fromType("Color", { color: scaled });
        p.lateralSurfaceMaterial = mat;
        p.domeSurfaceMaterial = mat;
      }
      if (c.visible)
        p.viewshedVisibleColor = c.visible.withAlpha(
          Math.max(0.06, c.visible.alpha / Math.max(1, parts.length))
        );
      if (c.occluded) p.viewshedOccludedColor = c.occluded;
    });
  };

  return { parts, setPose, setFlags, setColors };
}

export function createConicSensorOrComposite(opts: {
  viewer: any;
  modelMatrix: Cesium.Matrix4;
  fovDeg: number; // 0..360 full
  radius: number;
  sensorColor: Cesium.Color;
  include3DModels?: boolean;
}): { sensor?: IonSensor; composite?: SensorComposite } {
  const desiredFullFovDeg = Math.max(0, Math.min(360, opts.fovDeg));
  const volume = opts.sensorColor.withAlpha(0.25);
  const visible = opts.sensorColor.withAlpha(0.35);
  const occluded = Cesium.Color.fromBytes(255, 0, 0, 110);

  // Always single cone; clamp to <= 179.9° full (<= 90° half)
  const clampedFull = Math.max(1, Math.min(179.9, desiredFullFovDeg));
  const halfRad = Cesium.Math.toRadians(clampedFull / 2);
  const mat = Cesium.Material.fromType("Color", { color: volume });
  const sensor = new ConicSensor({
    modelMatrix: opts.modelMatrix,
    radius: Math.max(1, opts.radius),
    outerHalfAngle: halfRad,
    lateralSurfaceMaterial: mat,
    domeSurfaceMaterial: mat,
    showLateralSurfaces: true,
    showDomeSurfaces: true,
    showViewshed: true,
    showEllipsoidSurfaces: false,
    showEllipsoidHorizonSurfaces: false,
    showThroughEllipsoid: false,
    environmentConstraint: true,
    include3DModels: opts.include3DModels !== false,
  } as any);
  sensor.viewshedVisibleColor = visible;
  sensor.viewshedOccludedColor = occluded;
  opts.viewer.scene.primitives.add(sensor);
  return { sensor };
}

export function createRectangularSensor(opts: {
  viewer: any;
  modelMatrix: Cesium.Matrix4;
  fovHdeg: number; // full horizontal deg
  fovVdeg: number; // full vertical deg
  radius: number;
  sensorColor: Cesium.Color;
  include3DModels?: boolean;
}): IonSensor {
  const sanitize = (deg: number) => {
    if (!Number.isFinite(deg)) return 60;
    const mod = ((deg % 360) + 360) % 360;
    const folded = mod > 180 ? 360 - mod : mod;
    return Math.min(179.9, Math.max(1, folded));
  };
  const xHalf = Cesium.Math.toRadians(sanitize(opts.fovHdeg) / 2);
  const yHalf = Cesium.Math.toRadians(sanitize(opts.fovVdeg) / 2);
  const mat = Cesium.Material.fromType("Color", {
    color: opts.sensorColor.withAlpha(0.25),
  });
  const sensor = new RectangularSensor({
    modelMatrix: opts.modelMatrix,
    radius: Math.max(1, opts.radius),
    xHalfAngle: xHalf,
    yHalfAngle: yHalf,
    lateralSurfaceMaterial: mat,
    domeSurfaceMaterial: mat,
    showLateralSurfaces: true,
    showDomeSurfaces: false,
    showViewshed: true,
    showEllipsoidSurfaces: false,
    showEllipsoidHorizonSurfaces: false,
    showThroughEllipsoid: false,
    environmentConstraint: true,
    include3DModels: opts.include3DModels !== false,
  } as any);
  sensor.viewshedVisibleColor = opts.sensorColor.withAlpha(0.35);
  sensor.viewshedOccludedColor = Cesium.Color.fromBytes(255, 0, 0, 110);
  opts.viewer.scene.primitives.add(sensor);
  return sensor;
}

export function updatePose(
  target: IonSensor | SensorComposite,
  modelMatrix: Cesium.Matrix4
) {
  const isDead = (x: any) =>
    !x || (typeof x.isDestroyed === "function" && x.isDestroyed());
  if ((target as SensorComposite).parts) {
    (target as SensorComposite).parts.forEach((p) => {
      if (!isDead(p)) (p as IonSensor).modelMatrix = modelMatrix;
    });
  } else if (!isDead(target)) {
    (target as IonSensor).modelMatrix = modelMatrix;
  }
}

export function updateFlags(
  target: IonSensor | SensorComposite,
  opts: { show?: boolean; showGeometry?: boolean; showViewshed?: boolean }
) {
  const isDead = (x: any) =>
    !x || (typeof x.isDestroyed === "function" && x.isDestroyed());
  if ((target as SensorComposite).parts) {
    (target as SensorComposite).parts.forEach((p) => {
      if (isDead(p)) return;
      if (opts.show !== undefined) (p as any).show = opts.show;
      if (opts.showViewshed !== undefined)
        (p as any).showViewshed = opts.showViewshed;
      if (opts.showGeometry !== undefined) {
        (p as any).showLateralSurfaces = opts.showGeometry;
        (p as any).showDomeSurfaces = opts.showGeometry;
      }
    });
    return;
  }
  const s = target as IonSensor;
  if (isDead(s)) return;
  if (opts.show !== undefined) (s as any).show = opts.show;
  if (opts.showGeometry !== undefined) {
    (s as any).showLateralSurfaces = opts.showGeometry;
    (s as any).showDomeSurfaces = opts.showGeometry;
  }
  if (opts.showViewshed !== undefined)
    (s as any).showViewshed = opts.showViewshed;
}

export function updateColors(
  target: IonSensor | SensorComposite,
  colors: {
    volume?: Cesium.Color;
    visible?: Cesium.Color;
    occluded?: Cesium.Color;
  }
) {
  const isDead = (x: any) =>
    !x || (typeof x.isDestroyed === "function" && x.isDestroyed());
  if ((target as SensorComposite).parts) {
    (target as SensorComposite).parts.forEach((p) => {
      if (isDead(p)) return;
      if (colors.volume) {
        const mat = Cesium.Material.fromType("Color", { color: colors.volume });
        (p as any).lateralSurfaceMaterial = mat;
        (p as any).domeSurfaceMaterial = mat;
      }
      if (colors.visible) (p as any).viewshedVisibleColor = colors.visible;
      if (colors.occluded) (p as any).viewshedOccludedColor = colors.occluded;
    });
    return;
  }
  const s = target as IonSensor;
  if (isDead(s)) return;
  if (colors.volume) {
    const mat = Cesium.Material.fromType("Color", { color: colors.volume });
    (s as any).lateralSurfaceMaterial = mat;
    (s as any).domeSurfaceMaterial = mat;
  }
  if (colors.visible) (s as any).viewshedVisibleColor = colors.visible;
  if (colors.occluded) (s as any).viewshedOccludedColor = colors.occluded;
}

export function updateFovRadius(
  target: IonSensor | SensorComposite,
  opts: { fovDeg?: number; radius?: number }
) {
  const r = opts.radius !== undefined ? Math.max(1, opts.radius) : undefined;
  const fullDeg =
    opts.fovDeg !== undefined
      ? Math.max(0, Math.min(360, opts.fovDeg))
      : undefined;

  const isDead = (x: any) =>
    !x || (typeof x.isDestroyed === "function" && x.isDestroyed());
  if ((target as SensorComposite).parts) {
    const comp = target as SensorComposite;
    const n = comp.parts.length;
    comp.parts.forEach((p) => {
      if (isDead(p)) return;
      if (r !== undefined) (p as any).radius = r;
      if (fullDeg !== undefined && n > 0) {
        const partFull = Math.min(179.9, fullDeg / n);
        const half = Cesium.Math.toRadians(partFull / 2);
        (p as any).outerHalfAngle = half;
      }
    });
    return;
  }

  const s = target as IonSensor;
  if (isDead(s)) return;
  if (r !== undefined) (s as any).radius = r;
  if (fullDeg !== undefined && "outerHalfAngle" in s) {
    (s as any).outerHalfAngle = Cesium.Math.toRadians(
      Math.min(179.9, Math.max(1, fullDeg)) / 2
    );
  }
}
