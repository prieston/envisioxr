"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useSceneStore } from "@envisio/core";
import { toast } from "react-toastify";

// Use Cesium.Math from "cesium" everywhere

// Import monolithic Cesium for compatibility with Ion SDK
import * as Cesium from "cesium";

// Import Ion SDK modules directly
// Types exist in d.ts but import as any to avoid strict named export typing
import {
  createConicSensorOrComposite,
  createRectangularSensor as createIonRectangularSensor,
  updatePose as updateIonPose,
  updateFlags as updateIonFlags,
  updateFovRadius as updateIonFovRadius,
  updateColors as updateIonColors,
} from "../utils/sensors";
import * as IonSensors from "../vendor/cesium-ion-sdk/ion-sdk-sensors";
import * as IonGeometry from "../vendor/cesium-ion-sdk/ion-sdk-geometry";

// Sensor axis alignment utilities
function axisToVec(
  a: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-"
): Cesium.Cartesian3 {
  switch (a) {
    case "X+":
      return new Cesium.Cartesian3(1, 0, 0);
    case "X-":
      return new Cesium.Cartesian3(-1, 0, 0);
    case "Y+":
      return new Cesium.Cartesian3(0, 1, 0);
    case "Y-":
      return new Cesium.Cartesian3(0, -1, 0);
    case "Z+":
      return new Cesium.Cartesian3(0, 0, 1);
    case "Z-":
      return new Cesium.Cartesian3(0, 0, -1);
  }
}

// Build a quaternion that rotates `from` to `to` (both unit vectors)
function quatBetween(
  from: Cesium.Cartesian3,
  to: Cesium.Cartesian3
): Cesium.Quaternion {
  const f = Cesium.Cartesian3.normalize(from, new Cesium.Cartesian3());
  const t = Cesium.Cartesian3.normalize(to, new Cesium.Cartesian3());
  const dot = Cesium.Cartesian3.dot(f, t);

  // Nearly opposite: pick any orthogonal axis
  if (dot < -0.999999) {
    const ortho =
      Math.abs(f.x) < 0.9
        ? new Cesium.Cartesian3(1, 0, 0)
        : new Cesium.Cartesian3(0, 1, 0);
    const axis = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(f, ortho, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    return Cesium.Quaternion.fromAxisAngle(axis, Math.PI);
  }
  // Nearly identical
  if (dot > 0.999999) {
    return Cesium.Quaternion.IDENTITY;
  }
  const axis = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.cross(f, t, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );
  const angle = Math.acos(dot);
  return Cesium.Quaternion.fromAxisAngle(axis, angle);
}

// Build a local correction Matrix4 that aligns the sensor's forward axis to your model's front axis.
function buildLocalInstallMatrix(
  sensorForward: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-",
  modelFront: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-",
  tiltDeg = 0
): Cesium.Matrix4 {
  const qAlign = quatBetween(axisToVec(sensorForward), axisToVec(modelFront));
  let q = qAlign;
  if (tiltDeg && Math.abs(tiltDeg) > 1e-6) {
    // extra twist around forward axis after alignment
    const qTilt = Cesium.Quaternion.fromAxisAngle(
      axisToVec(modelFront),
      Cesium.Math.toRadians(tiltDeg)
    );
    q = Cesium.Quaternion.multiply(qAlign, qTilt, new Cesium.Quaternion());
  }
  const m3 = Cesium.Matrix3.fromQuaternion(q);
  return Cesium.Matrix4.fromRotationTranslation(m3, Cesium.Cartesian3.ZERO);
}

// Composite conic sensor for >180° coverage by tiling multiple cones around local axis
type SensorComposite = {
  parts: any[];
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
  desiredFullFovDeg: number;
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

  const safeFull = Math.min(179.9, full);
  const partFull = Math.min(179.9, safeFull);
  const partHalfRad = Cesium.Math.toRadians(partFull / 2);
  const numParts = Math.max(1, Math.ceil(full / partFull));

  const parts: any[] = [];
  for (let i = 0; i < numParts; i++) {
    const yaw = Cesium.Math.toRadians((i * 360) / numParts);
    const localRot = Cesium.Matrix3.fromQuaternion(
      Cesium.Quaternion.fromAxisAngle(new Cesium.Cartesian3(0, 0, 1), yaw)
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

    const volumeMat = Cesium.Material.fromType("Color", { color: volumeColor });
    const part = new (IonSensors as any).ConicSensor({
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
    part.viewshedVisibleColor = viewshedVisible;
    part.viewshedOccludedColor = viewshedOccluded;
    viewer.scene.primitives.add(part);
    parts.push(part);
  }

  const setPose = (modelMatrix: Cesium.Matrix4) => {
    parts.forEach((p, i) => {
      const yaw = Cesium.Math.toRadians((i * 360) / parts.length);
      const localRot = Cesium.Matrix3.fromQuaternion(
        Cesium.Quaternion.fromAxisAngle(new Cesium.Cartesian3(0, 0, 1), yaw)
      );
      const localMM = Cesium.Matrix4.fromRotationTranslation(
        localRot,
        Cesium.Cartesian3.ZERO
      );
      p.modelMatrix = Cesium.Matrix4.multiply(
        modelMatrix,
        localMM,
        new Cesium.Matrix4()
      );
    });
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
        const mat = Cesium.Material.fromType("Color", { color: c.volume });
        p.lateralSurfaceMaterial = mat;
        p.domeSurfaceMaterial = mat;
      }
      if (c.visible) p.viewshedVisibleColor = c.visible;
      if (c.occluded) p.viewshedOccludedColor = c.occluded;
    });
  };

  return { parts, setPose, setFlags, setColors };
}

// Model front direction utilities
function getRotationOffsetForFrontAxis(frontAxis: string): {
  heading: number;
  pitch: number;
  roll: number;
} {
  let offset;
  switch (frontAxis) {
    case "x":
      offset = { heading: Math.PI / 2, pitch: -Math.PI / 2, roll: 0 };
      break;
    case "negX":
      offset = { heading: -Math.PI / 2, pitch: -Math.PI / 2, roll: 0 };
      break;
    case "y":
      offset = { heading: 0, pitch: 0, roll: 0 };
      break;
    case "negY":
      offset = { heading: 0, pitch: Math.PI, roll: 0 };
      break;
    case "z":
      offset = { heading: 0, pitch: -Math.PI / 2, roll: 0 };
      break;
    case "negZ":
      offset = { heading: Math.PI, pitch: -Math.PI / 2, roll: 0 };
      break;
    default:
      offset = { heading: 0, pitch: -Math.PI / 2, roll: 0 };
  }
  return offset;
}

function applyModelFrontDirection(
  baseRotation: [number, number, number],
  alignWithModelFront: boolean,
  manualFrontDirection?: "x" | "y" | "z" | "negX" | "negY" | "negZ",
  modelFrontAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-"
): [number, number, number] {
  if (!alignWithModelFront) {
    return baseRotation;
  }

  let frontAxis: string;

  if (manualFrontDirection) {
    frontAxis = manualFrontDirection;
  } else if (modelFrontAxis) {
    // Convert modelFrontAxis format to our format
    const axisMap: Record<string, string> = {
      "X+": "x",
      "X-": "negX",
      "Y+": "y",
      "Y-": "negY",
      "Z+": "z",
      "Z-": "negZ",
    };
    frontAxis = axisMap[modelFrontAxis] || "z";
  } else {
    frontAxis = "z"; // Default to forward facing
  }

  const offset = getRotationOffsetForFrontAxis(frontAxis);

  // Add the offset to the base rotation
  const result = [
    baseRotation[0] + offset.heading,
    baseRotation[1] + offset.pitch,
    baseRotation[2] + offset.roll,
  ];

  return result as [number, number, number];
}

interface CesiumIonSDKViewshedAnalysisProps {
  position: [number, number, number]; // [longitude, latitude, height]
  rotation: [number, number, number]; // [heading, pitch, roll] in radians
  observationProperties: {
    sensorType: "cone" | "rectangle" | "dome" | "custom";
    fov: number;
    fovH?: number;
    fovV?: number;
    maxPolar?: number;
    visibilityRadius: number;
    showSensorGeometry: boolean;
    showViewshed: boolean;
    sensorColor?: string;
    viewshedColor?: string;
    analysisQuality: "low" | "medium" | "high";
    // Transform editor properties removed
    include3DModels?: boolean;
    // Model Direction
    alignWithModelFront?: boolean;
    manualFrontDirection?: "x" | "y" | "z" | "negX" | "negY" | "negZ";
    modelFrontAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-";
    sensorForwardAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-";
    tiltDeg?: number;
  };
  objectId: string;
  cesiumViewer?: any; // Cesium viewer instance
}

const CesiumIonSDKViewshedAnalysis: React.FC<
  CesiumIonSDKViewshedAnalysisProps
> = ({
  position,
  rotation,
  observationProperties,
  objectId: _objectId,
  cesiumViewer: providedViewer,
}) => {
  // Use provided cesiumViewer or fallback to window global
  const cesiumViewer = providedViewer || (window as any).cesiumViewer;
  const sensorRef = useRef<any>(null);
  const sensorCompositeRef = useRef<SensorComposite | null>(null);
  const viewshedRef = useRef<Cesium.Entity | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const lastShapeSigRef = useRef<string>("");
  const mountedRef = useRef(true);

  // Mounted guard
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize Ion SDK modules
  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;

    const initializeIonSDK = async () => {
      try {
        // Initialize sensors module
        const initializeSensors = (IonSensors as any).initializeSensors;
        if (typeof initializeSensors === "function") {
          try {
            await initializeSensors();
            console.log("✅ Ion SDK sensors initialized");
          } catch (error: any) {
            if (
              error?.message &&
              error.message.includes("Cannot redefine property")
            ) {
              console.log("Ion SDK sensors already initialized, skipping...");
            } else {
              throw error;
            }
          }
        }

        // Initialize geometry module
        const initializeGeometry = (IonGeometry as any).initializeGeometry;
        if (typeof initializeGeometry === "function") {
          try {
            await initializeGeometry();
            console.log("✅ Ion SDK geometry initialized");
          } catch (error: any) {
            if (
              error?.message &&
              error.message.includes("Cannot redefine property")
            ) {
              console.log("Ion SDK geometry already initialized, skipping...");
            } else {
              throw error;
            }
          }
        }

        setIsInitialized(true);
        console.log("✅ Viewshed analysis component initialized");
      } catch (err) {
        console.error("❌ Failed to initialize Ion SDK modules:", err);
        toast.error("Failed to initialize Ion SDK modules", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    initializeIonSDK();
  }, [cesiumViewer, isInitialized]);

  // Create professional sensor using Ion SDK

  const createIonSDKSensor = useCallback(() => {
    console.log("🔍 createIonSDKSensor called", {
      isInitialized,
      cesiumViewer: !!cesiumViewer,
      position,
      rotation,
      observationProperties,
    });

    if (!isInitialized || !cesiumViewer) {
      // Ion SDK not loaded, skipping sensor creation
      console.log(
        "🔍 Skipping sensor creation - not initialized or no cesiumViewer"
      );
      return;
    }

    // Guard: avoid duplicate creates when shape signature hasn't changed (StrictMode)
    const shapeSig = JSON.stringify({
      type: observationProperties.sensorType,
      fov: observationProperties.fov,
      fovH: observationProperties.fovH,
      fovV: observationProperties.fovV,
      radius: observationProperties.visibilityRadius,
      color: observationProperties.sensorColor,
      include: observationProperties.include3DModels,
    });
    if (lastShapeSigRef.current === shapeSig) {
      return;
    }
    lastShapeSigRef.current = shapeSig;

    // Always remove existing composite first
    if (sensorCompositeRef.current) {
      try {
        sensorCompositeRef.current.parts.forEach((p) =>
          cesiumViewer?.scene.primitives.remove(p)
        );
      } catch {}
      sensorCompositeRef.current = null;
    }

    // Always remove existing sensor first
    if (sensorRef.current) {
      if (sensorRef.current instanceof Cesium.Entity) {
        cesiumViewer?.entities.remove(sensorRef.current);
      } else {
        cesiumViewer?.scene.primitives.remove(sensorRef.current);
      }
      sensorRef.current = null;
    }

    // Remove existing sensor entity

    // Always (re)create the sensor. Geometry visibility is controlled via flags
    console.log(
      "🔍 showSensorGeometry:",
      observationProperties.showSensorGeometry
    );

    try {
      // Ensure position is an array with default values
      const positionArray = Array.isArray(position) ? position : [0, 0, 0];
      const [longitude, latitude, height] = positionArray;

      // Ensure rotation is an array with default values
      const rotationArray: [number, number, number] =
        Array.isArray(rotation) && rotation.length >= 3
          ? [rotation[0] || 0, rotation[1] || 0, rotation[2] || 0]
          : [0, 0, 0];

      // Use raw rotation directly (no double correction with install matrix)
      const [heading = 0, pitch = 0, roll = 0] = rotationArray;

      console.log("🔍 Rotation calculation:", {
        baseRotation: rotationArray,
        alignWithModelFront: observationProperties.alignWithModelFront,
        manualFrontDirection: observationProperties.manualFrontDirection,
        modelFrontAxis: observationProperties.modelFrontAxis,
        // finalRotation,
        heading: `${((heading * 180) / Math.PI).toFixed(1)}°`,
        pitch: `${((pitch * 180) / Math.PI).toFixed(1)}°`,
        roll: `${((roll * 180) / Math.PI).toFixed(1)}°`,
      });

      // 1) Build world position
      const sensorPosition = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );

      // 2) Build rotation from HPR in proper ENU frame
      const hpr = new Cesium.HeadingPitchRoll(
        heading || 0,
        pitch || 0,
        roll || 0
      );

      // 1) World pose in ENU
      let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        sensorPosition,
        hpr,
        Cesium.Ellipsoid.WGS84,
        Cesium.Transforms.eastNorthUpToFixedFrame
      );

      // 2) Local install: map sensor's forward → model's front
      const sensorForward = observationProperties.sensorForwardAxis ?? "X+"; // Ion sensors typically look down +X
      const modelFront = observationProperties.modelFrontAxis ?? "Z+"; // Use model forward +Z by default
      const install = buildLocalInstallMatrix(
        sensorForward,
        modelFront,
        observationProperties.tiltDeg ?? 0
      );

      // 3) Apply local correction (right-multiply: local space)
      modelMatrix = Cesium.Matrix4.multiply(
        modelMatrix,
        install,
        new Cesium.Matrix4()
      );

      // 4) Validate (avoid NaNs/Infs)
      if (
        !Number.isFinite(sensorPosition.x) ||
        !Number.isFinite(sensorPosition.y) ||
        !Number.isFinite(sensorPosition.z)
      ) {
        console.error("❌ Invalid sensor position:", sensorPosition);
        return;
      }

      console.log("🔍 Raw position values:", { longitude, latitude, height });
      console.log("🔍 Calculated position:", sensorPosition);
      console.log("🔍 Raw rotation values:", { heading, pitch, roll });
      console.log("🔍 Model matrix:", modelMatrix);
      console.log(
        "🔍 Sensor color property:",
        observationProperties.sensorColor
      );

      // Validate radius
      const radius = Math.max(1, observationProperties.visibilityRadius || 100);
      if (!isFinite(radius) || radius <= 0) {
        console.error("❌ Invalid radius:", radius);
        return;
      }

      // Determine the color to use
      const sensorColor = (
        observationProperties.sensorColor
          ? Cesium.Color.fromCssColorString(observationProperties.sensorColor)
          : Cesium.Color.GREEN
      ).withAlpha(1.0);

      console.log("🔍 Computed sensor color:", sensorColor);
      console.log("🔍 Color components:", {
        r: sensorColor.red,
        g: sensorColor.green,
        b: sensorColor.blue,
        alpha: sensorColor.alpha,
      });

      // Build a simple color material for the primitive surfaces
      const sensorMat = Cesium.Material.fromType("Color", {
        color: sensorColor,
      });

      const baseOptions = {
        modelMatrix, // ✅ single source of truth for the sensor's frame
        radius,
        // tint the sensor geometry (non-viewshed rendering)
        lateralSurfaceMaterial: sensorMat,
        domeSurfaceMaterial: sensorMat,
        // optional: also color ellipsoid horizon / intersection surfaces
        // ellipsoidHorizonSurfaceMaterial: sensorMat,
        // ellipsoidSurfaceMaterial: sensorMat,

        showLateralSurfaces: !!observationProperties.showSensorGeometry,
        showDomeSurfaces:
          !!observationProperties.showSensorGeometry &&
          observationProperties.sensorType === "cone",

        // viewshed rendering (when enabled) uses these colors instead
        showViewshed: !!observationProperties.showViewshed,

        environmentConstraint: true,
        include3DModels: observationProperties.include3DModels !== false,
      };

      console.log("🔍 Base options for sensor:", baseOptions);

      // Creating Ion SDK sensor with options
      console.log(
        "🔍 Creating sensor with type:",
        observationProperties.sensorType
      );

      let sensor: any = null;
      sensorCompositeRef.current = null; // reset composite
      if (observationProperties.sensorType === "rectangle") {
        const rect = createIonRectangularSensor({
          viewer: cesiumViewer,
          modelMatrix,
          fovHdeg:
            observationProperties.fovH ?? observationProperties.fov ?? 60,
          fovVdeg:
            observationProperties.fovV ??
            (observationProperties.fov ?? 60) * 0.6,
          radius,
          sensorColor,
          include3DModels: observationProperties.include3DModels,
        });
        sensor = rect;
      } else {
        const { sensor: single, composite } = createConicSensorOrComposite({
          viewer: cesiumViewer,
          modelMatrix,
          fovDeg: observationProperties.fov ?? 60,
          radius,
          sensorColor,
          include3DModels: observationProperties.include3DModels,
        });
        if (composite) sensorCompositeRef.current = composite;
        sensor = single ?? composite?.parts[0] ?? null;
      }

      if (sensor) {
        // Helper already added primitives; just store reference
        sensorRef.current = sensor;

        // Debug: Log what the primitive actually exposes
        console.log("🔍 sensor keys:", Object.keys(sensor));
        console.log("🔍 appearance:", sensor.appearance);
        console.log("🔍 appearance.material:", sensor.appearance?.material);
        console.log("🔍 uniforms:", sensor.appearance?.material?.uniforms);

        updateIonColors(sensorCompositeRef.current ?? sensor, {
          volume: sensorColor.withAlpha(0.25),
          visible: sensorColor.withAlpha(0.35),
          occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
        });

        updateIonFlags(sensorCompositeRef.current ?? sensor, {
          show:
            !!observationProperties.showSensorGeometry ||
            !!observationProperties.showViewshed,
          showGeometry: !!observationProperties.showSensorGeometry,
          showViewshed: !!observationProperties.showViewshed,
        });

        // 3) Give the volume a translucent color so you can see it
        const volumeMat = Cesium.Material.fromType("Color", {
          color: sensorColor.withAlpha(0.25),
        });
        sensor.lateralSurfaceMaterial = volumeMat;
        sensor.domeSurfaceMaterial = volumeMat;

        // 4) These extras can stay off if they caused white overlays
        sensor.showEnvironmentOcclusion = false;
        sensor.showEnvironmentIntersection = false;
        sensor.showIntersection = false;

        // 5) Force a draw
        cesiumViewer.scene.requestRender();

        // 6) Runtime debugging toggles (uncomment if needed)
        // cesiumViewer.scene.highDynamicRange = false;
        // cesiumViewer.scene.globe.show = true;
        // cesiumViewer.scene.globe.depthTestAgainstTerrain = false;

        console.log(
          "✅ Sensor created with proper materials and viewshed colors"
        );

        // No longer creating clickable entities
      } else {
        // Sensor creation returned null
      }
    } catch (err) {
      // Error creating Ion SDK sensor
      console.error("❌ Error creating Ion SDK sensor:", err);
      console.error("❌ Error details:", {
        message: (err as any)?.message,
        stack: (err as any)?.stack,
        position,
        rotation,
        observationProperties,
      });
      toast.error(`Failed to create sensor: ${(err as any)?.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [
    isInitialized,
    cesiumViewer,
    position,
    rotation,
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    observationProperties.showViewshed,
    observationProperties.alignWithModelFront,
    observationProperties.manualFrontDirection,
    observationProperties.modelFrontAxis,
  ]);

  // Perform professional viewshed analysis
  const performViewshedAnalysis = useCallback(async () => {
    // No-op: The Ion SDK primitive renders viewshed when sensor.showViewshed is true.
    // Keep this hook to react to toggles, but avoid emitting false warnings.
    if (!isInitialized) return;
    if (!sensorRef.current && !sensorCompositeRef.current) return;
    updateIonFlags(sensorCompositeRef.current ?? sensorRef.current, {
      showViewshed: !!observationProperties.showViewshed,
      show:
        !!observationProperties.showSensorGeometry ||
        !!observationProperties.showViewshed,
    });
    cesiumViewer?.scene.requestRender();
  }, [
    isInitialized,
    cesiumViewer,
    position,
    rotation,
    observationProperties.showViewshed,
    observationProperties.analysisQuality,
    observationProperties.viewshedColor,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.maxPolar,
    observationProperties.visibilityRadius,
  ]);

  // Note: Measurements are handled by the TransformEditor component

  // Update sensor pose for position/rotation changes (smooth updates)
  useEffect(() => {
    if (!isInitialized || (!sensorRef.current && !sensorCompositeRef.current))
      return;

    // Ensure position is an array with default values
    const positionArray = Array.isArray(position) ? position : [0, 0, 0];
    const [longitude, latitude, height] = positionArray;

    // Ensure rotation is an array with default values
    const rotationArray: [number, number, number] =
      Array.isArray(rotation) && rotation.length >= 3
        ? [rotation[0] || 0, rotation[1] || 0, rotation[2] || 0]
        : [0, 0, 0];

    // Use raw rotation directly (no double correction with install matrix)
    const [heading = 0, pitch = 0, roll = 0] = rotationArray;

    const sensorPosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );
    const hpr = new Cesium.HeadingPitchRoll(
      heading || 0,
      pitch || 0,
      roll || 0
    );

    // 1) World pose in ENU
    let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      sensorPosition,
      hpr,
      Cesium.Ellipsoid.WGS84,
      Cesium.Transforms.eastNorthUpToFixedFrame
    );

    // 2) Local install: map sensor's forward → model's front
    const sensorForward = observationProperties.sensorForwardAxis ?? "X+"; // Ion sensors typically look down +X
    const modelFront = observationProperties.modelFrontAxis ?? "Z+"; // Use model forward +Z by default
    const install = buildLocalInstallMatrix(
      sensorForward,
      modelFront,
      observationProperties.tiltDeg ?? 0
    );

    // 3) Apply local correction (right-multiply: local space)
    modelMatrix = Cesium.Matrix4.multiply(
      modelMatrix,
      install,
      new Cesium.Matrix4()
    );

    // Update sensor pose in place via helpers
    updateIonPose(sensorCompositeRef.current ?? sensorRef.current, modelMatrix);
    cesiumViewer?.scene.requestRender();
  }, [
    isInitialized,
    position,
    rotation,
    cesiumViewer,
    observationProperties.alignWithModelFront,
    observationProperties.manualFrontDirection,
    observationProperties.modelFrontAxis,
    observationProperties.sensorForwardAxis,
    observationProperties.tiltDeg,
  ]);

  // Create sensor when geometry/shape-affecting properties change
  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [
    isInitialized,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    observationProperties.include3DModels,
  ]);

  // Live-update radius and FOV via helpers
  useEffect(() => {
    if (!isInitialized) return;
    if (!sensorRef.current && !sensorCompositeRef.current) return;
    try {
      updateIonFovRadius(sensorCompositeRef.current ?? sensorRef.current, {
        fovDeg: observationProperties.fov,
        radius: observationProperties.visibilityRadius,
      });
      cesiumViewer?.scene.requestRender();
    } catch {}
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.fov,
    observationProperties.visibilityRadius,
  ]);

  // Listen for imperative preview updates (during slider drag)
  useEffect(() => {
    if (!isInitialized) return;

    const handlePreview = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { objectId: previewObjectId, patch } = customEvent.detail || {};

      // Only handle events for this object
      if (previewObjectId !== _objectId) return;
      if (!sensorRef.current && !sensorCompositeRef.current) return;

      try {
        // Apply preview updates imperatively without triggering React re-render
        if (patch.fov !== undefined || patch.visibilityRadius !== undefined) {
          updateIonFovRadius(sensorCompositeRef.current ?? sensorRef.current, {
            fovDeg: patch.fov ?? observationProperties.fov,
            radius:
              patch.visibilityRadius ?? observationProperties.visibilityRadius,
          });
        }
        cesiumViewer?.scene.requestRender();
      } catch (err) {
        console.warn(
          "[CesiumIonSDKViewshedAnalysis] Preview update failed:",
          err
        );
      }
    };

    window.addEventListener("cesium-observation-preview", handlePreview);
    return () => {
      window.removeEventListener("cesium-observation-preview", handlePreview);
    };
  }, [
    isInitialized,
    _objectId,
    cesiumViewer,
    observationProperties.fov,
    observationProperties.visibilityRadius,
  ]);

  // Update visibility flags (geometry and viewshed) without recreating
  useEffect(() => {
    if (!isInitialized || (!sensorRef.current && !sensorCompositeRef.current))
      return;
    try {
      updateIonFlags(sensorCompositeRef.current ?? sensorRef.current, {
        show:
          !!observationProperties.showSensorGeometry ||
          !!observationProperties.showViewshed,
        showGeometry: !!observationProperties.showSensorGeometry,
        showViewshed: !!observationProperties.showViewshed,
      });
      cesiumViewer?.scene.requestRender();
    } catch {}
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.showSensorGeometry,
    observationProperties.showViewshed,
    observationProperties.sensorType,
  ]);

  // Transform editor removed to prevent issues

  // Perform viewshed analysis when properties change
  useEffect(() => {
    if (!isInitialized) return;
    performViewshedAnalysis();
  }, [isInitialized, performViewshedAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const safeRemove = (p: any) => {
        try {
          if (p && typeof p.isDestroyed === "function" && !p.isDestroyed()) {
            cesiumViewer?.scene.primitives.remove(p);
          }
        } catch {}
      };
      sensorCompositeRef.current?.parts.forEach(safeRemove);
      if (sensorRef.current) safeRemove(sensorRef.current);
      sensorCompositeRef.current = null;
      lastShapeSigRef.current = "";
      sensorRef.current = null;
      if (viewshedRef.current) {
        cesiumViewer?.entities.remove(viewshedRef.current);
      }
      // Ion SDK modules are global, no cleanup needed
    };
  }, [cesiumViewer]);

  // Expose toggle function globally for easy access
  useEffect(() => {
    (window as any).toggleSensorGeometry = () => {
      const target = sensorCompositeRef.current ?? sensorRef.current;
      if (!target) return;
      const parts = (target as any).parts ?? [target];
      parts.forEach((p: any) => (p.show = !p.show));
      cesiumViewer?.scene.requestRender();
    };

    // Debug rendering state
    (window as any).debugSensorRendering = () => {
      if (sensorRef.current && cesiumViewer) {
        console.log("🔍 Sensor debugging:", {
          sensor: sensorRef.current,
          showViewshed: sensorRef.current.showViewshed,
          viewshedVisibleColor: sensorRef.current.viewshedVisibleColor,
          viewshedOccludedColor: sensorRef.current.viewshedOccludedColor,
          showLateralSurfaces: sensorRef.current.showLateralSurfaces,
          showDomeSurfaces: sensorRef.current.showDomeSurfaces,
          lateralSurfaceMaterial: sensorRef.current.lateralSurfaceMaterial,
          domeSurfaceMaterial: sensorRef.current.domeSurfaceMaterial,
          sceneHDR: cesiumViewer.scene.highDynamicRange,
          globeShow: cesiumViewer.scene.globe.show,
          depthTestAgainstTerrain:
            cesiumViewer.scene.globe.depthTestAgainstTerrain,
        });

        // Try the debugging toggles
        cesiumViewer.scene.highDynamicRange = false;
        cesiumViewer.scene.globe.show = true;
        cesiumViewer.scene.globe.depthTestAgainstTerrain = false;
        cesiumViewer.scene.requestRender();
      }
    };

    return () => {
      delete (window as any).toggleSensorGeometry;
      delete (window as any).debugSensorRendering;
    };
  }, [cesiumViewer]);

  // Show loading state with proper z-index
  if (!isInitialized) {
    return (
      <div
        style={{
          position: "fixed",
          top: "80px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        Initializing Ion SDK...
      </div>
    );
  }

  // Show calculating state with proper z-index
  if (isCalculating) {
    return (
      <div
        style={{
          position: "fixed",
          top: "80px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        Calculating professional viewshed analysis...
      </div>
    );
  }

  return null; // This component doesn't render anything visible
};

export default CesiumIonSDKViewshedAnalysis;
