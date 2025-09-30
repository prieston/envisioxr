"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useSceneStore } from "@envisio/core/state";
import { toast } from "react-toastify";

// Use Cesium.Math from "cesium" everywhere

// Import monolithic Cesium for compatibility with Ion SDK
import * as Cesium from "cesium";

// Import Ion SDK modules directly
import { RectangularSensor, ConicSensor } from "@cesiumgs/ion-sdk-sensors";
import * as IonSensors from "@cesiumgs/ion-sdk-sensors";
import * as IonGeometry from "@cesiumgs/ion-sdk-geometry";

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
  const viewshedRef = useRef<Cesium.Entity | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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

    // If showSensorGeometry is false, just return (sensor is already removed)
    console.log(
      "🔍 showSensorGeometry:",
      observationProperties.showSensorGeometry
    );
    if (!observationProperties.showSensorGeometry) {
      console.log("🔍 Sensor geometry disabled, sensor removed");
      return;
    }

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
      const modelFront = observationProperties.modelFrontAxis ?? "Z-"; // Three.js forward is Z-
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

        showLateralSurfaces: true,
        showDomeSurfaces: true,

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
      if (observationProperties.sensorType === "rectangle") {
        // Rectangular sensor: use half-angles in radians
        const xHalf = Cesium.Math.toRadians(
          (observationProperties.fovH ?? observationProperties.fov ?? 60) / 2
        );
        const yHalf = Cesium.Math.toRadians(
          (observationProperties.fovV ??
            (observationProperties.fov ?? 60) * 0.6) / 2
        );
        sensor = new RectangularSensor({
          ...baseOptions,
          xHalfAngle: xHalf,
          yHalfAngle: yHalf,
        });
      } else {
        // Conic sensor: use outerHalfAngle (half-angle in radians)
        const fovDeg = observationProperties.fov ?? 60;
        if (!Number.isFinite(fovDeg) || fovDeg <= 0 || fovDeg >= 180) {
          console.error("❌ Invalid FOV:", fovDeg);
          return;
        }
        const outerHalfAngle = Cesium.Math.toRadians(fovDeg / 2);
        sensor = new ConicSensor({
          ...baseOptions,
          outerHalfAngle,
        });
      }

      if (sensor) {
        // Add sensor to the scene
        try {
          cesiumViewer.scene.primitives.add(sensor);
          console.log("✅ Ion SDK sensor added to scene");
        } catch (error) {
          console.error("❌ Failed to add sensor to scene:", error);
        }
        sensorRef.current = sensor;

        // Debug: Log what the primitive actually exposes
        console.log("🔍 sensor keys:", Object.keys(sensor));
        console.log("🔍 appearance:", sensor.appearance);
        console.log("🔍 appearance.material:", sensor.appearance?.material);
        console.log("🔍 uniforms:", sensor.appearance?.material?.uniforms);

        // Apply colors via the public fields that this build exposes
        const visible = sensorColor.withAlpha(0.6); // your green with transparency like yellow
        const occluded = Cesium.Color.fromBytes(255, 0, 0, 160); // semi-red

        // 1) Keep viewshed overlay
        sensor.showViewshed = !!observationProperties.showViewshed;
        sensor.viewshedVisibleColor = visible;
        sensor.viewshedOccludedColor = occluded;

        // 2) SHOW the actual geometry (we previously turned these off)
        sensor.showLateralSurfaces = true;
        sensor.showDomeSurfaces = observationProperties.sensorType === "cone";

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
    if (!isInitialized || !observationProperties.showViewshed) {
      // Remove existing viewshed
      if (viewshedRef.current) {
        cesiumViewer?.entities.remove(viewshedRef.current);
        viewshedRef.current = null;
      }
      return;
    }

    setIsCalculating(true);

    try {
      // Ion SDK handles viewshed automatically when showViewshed is enabled
      // No need for custom ray sampling parameters
      // Ion SDK sensor created with built-in viewshed analysis

      // The viewshed is handled by the sensor itself via showViewshed: true
      // No additional computation needed
      const result = {
        polygonEntity: null, // Ion SDK handles this internally
        boundary: [],
      };

      if (result.polygonEntity) {
        viewshedRef.current = result.polygonEntity;
        // Professional viewshed analysis completed
      } else {
        // No visible area found in viewshed analysis
        toast.warning(
          "No visible area found - terrain may be blocking all views",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }
    } catch (err) {
      // Error performing viewshed analysis
      toast.error("Failed to perform viewshed analysis", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsCalculating(false);
    }
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
    if (!isInitialized || !sensorRef.current) return;

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
    const modelFront = observationProperties.modelFrontAxis ?? "Z-"; // Three.js forward is Z-
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

    // Update sensor pose in place
    sensorRef.current.modelMatrix = modelMatrix;
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

  // Create sensor when shape/visibility properties change
  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [
    isInitialized,
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    observationProperties.showViewshed,
    observationProperties.include3DModels,
    observationProperties.alignWithModelFront,
    observationProperties.manualFrontDirection,
    observationProperties.modelFrontAxis,
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
      if (sensorRef.current) {
        if (sensorRef.current instanceof Cesium.Entity) {
          cesiumViewer?.entities.remove(sensorRef.current);
        } else {
          cesiumViewer?.scene.primitives.remove(sensorRef.current);
        }
      }
      if (viewshedRef.current) {
        cesiumViewer?.entities.remove(viewshedRef.current);
      }
      // Ion SDK modules are global, no cleanup needed
    };
  }, [cesiumViewer]);

  // Expose toggle function globally for easy access
  useEffect(() => {
    (window as any).toggleSensorGeometry = () => {
      if (sensorRef.current) {
        if (sensorRef.current instanceof Cesium.Entity) {
          sensorRef.current.show = !sensorRef.current.show;
          // Sensor geometry toggled
        } else {
          // For Ion SDK primitives, we need to remove/add them
          if (sensorRef.current.show) {
            cesiumViewer?.scene.primitives.remove(sensorRef.current);
            sensorRef.current.show = false;
            // Sensor geometry hidden
          } else {
            cesiumViewer?.scene.primitives.add(sensorRef.current);
            sensorRef.current.show = true;
            // Sensor geometry shown
          }
        }
      }
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
