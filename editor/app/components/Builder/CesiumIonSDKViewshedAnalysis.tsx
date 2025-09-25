"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import useSceneStore from "../../hooks/useSceneStore";
import { toast } from "react-toastify";

// Use Cesium.Math from "cesium" everywhere

// Import monolithic Cesium for compatibility with Ion SDK
import * as Cesium from "cesium";

// --- helpers: always derive from the model's quaternion + optional local offset
function getModelQuaternionAtNow(
  viewer: Cesium.Viewer | undefined,
  modelEntity?: Cesium.Entity
) {
  if (!viewer || !modelEntity?.orientation) return undefined;
  const t = viewer.clock.currentTime; // ✅ scene clock
  return modelEntity.orientation.getValue(t) as Cesium.Quaternion | undefined;
}

// Map axis tags to unit vectors in local space
function axisToVector(
  tag: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-"
): Cesium.Cartesian3 {
  switch (tag) {
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

// Minimal "shortest arc" quaternion between two unit vectors (local space)
function quatFromTwoVectors(
  a: Cesium.Cartesian3,
  b: Cesium.Cartesian3
): Cesium.Quaternion {
  const v1 = Cesium.Cartesian3.normalize(a, new Cesium.Cartesian3());
  const v2 = Cesium.Cartesian3.normalize(b, new Cesium.Cartesian3());
  const cross = Cesium.Cartesian3.cross(v1, v2, new Cesium.Cartesian3());
  const dot = Cesium.Cartesian3.dot(v1, v2);

  if (dot < -0.999999) {
    // 180°: pick any orthogonal axis
    const axis =
      Math.abs(v1.x) < 0.9
        ? new Cesium.Cartesian3(1, 0, 0)
        : new Cesium.Cartesian3(0, 1, 0);
    const ortho = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(v1, axis, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    return Cesium.Quaternion.fromAxisAngle(ortho, Math.PI);
  }

  const s = Math.sqrt((1 + dot) * 2);
  const invs = 1 / s;
  return new Cesium.Quaternion(
    cross.x * invs,
    cross.y * invs,
    cross.z * invs,
    s * 0.5
  );
}

/**
 * Build a modelMatrix from:
 *  - world position (lon/lat/height)
 *  - model's current quaternion (entity orientation)
 *  - optional local offset quaternion (applied in the model's local frame)
 */
function buildSensorModelMatrix(
  positionDeg: [number, number, number],
  modelQuat: Cesium.Quaternion,
  localOffsetQuat?: Cesium.Quaternion
) {
  const [lon, lat, h] = positionDeg;
  const sensorPosition = Cesium.Cartesian3.fromDegrees(lon, lat, h);

  let finalQuat = modelQuat;
  if (localOffsetQuat) {
    // modelQuat * localOffset -> rotate in model's local frame
    finalQuat = Cesium.Quaternion.multiply(
      modelQuat,
      localOffsetQuat,
      new Cesium.Quaternion()
    );
  }

  const rotMat3 = Cesium.Matrix3.fromQuaternion(finalQuat);
  return Cesium.Matrix4.fromRotationTranslation(rotMat3, sensorPosition);
}

// Import Ion SDK modules directly
import { RectangularSensor, ConicSensor } from "@cesiumgs/ion-sdk-sensors";
import * as IonSensors from "@cesiumgs/ion-sdk-sensors";
import * as IonGeometry from "@cesiumgs/ion-sdk-geometry";

interface CesiumIonSDKViewshedAnalysisProps {
  position: [number, number, number]; // [longitude, latitude, height]
  observationProperties: {
    sensorType: "cone" | "rectangle";
    fov: number;
    fovH?: number;
    fovV?: number;
    visibilityRadius: number;
    showSensorGeometry: boolean;
    showViewshed: boolean;
    sensorColor?: string;
    viewshedColor?: string;
    analysisQuality: "low" | "medium" | "high";
    // Transform editor properties removed
    include3DModels?: boolean;
    alignWithModelFront?: boolean;
    modelFrontAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-";
    sensorForwardAxis?: "X+" | "X-" | "Y+" | "Y-" | "Z+" | "Z-"; // default "X+"
    tiltDeg?: number; // default -10
  };
  objectId: string;
}

// Global flags to prevent re-initialization
declare global {
  interface Window {
    __ionSensorsInit?: boolean;
    __ionGeometryInit?: boolean;
  }
}

// Detect if device can support viewshed analysis
function canSupportViewshed(viewer: Cesium.Viewer): boolean {
  const ctx: any = (viewer.scene as any).context;
  const gl: WebGLRenderingContext | WebGL2RenderingContext = (ctx &&
    ctx._gl) as any;
  if (!gl) return false;

  const isWebGL2 = !!(ctx && ctx.webgl2);
  const hasDepthTex = !!(gl.getExtension("WEBGL_depth_texture") || isWebGL2);
  const hasFloatTex = !!(gl.getExtension("OES_texture_float") || isWebGL2);
  const hasColorBufferFloat = !!(
    gl.getExtension("EXT_color_buffer_float") ||
    (gl as any).getExtension?.("WEBGL_color_buffer_float")
  );

  // viewshed generally needs depth textures + float color attachments
  return hasDepthTex && hasFloatTex && hasColorBufferFloat;
}

// Wait for Cesium to be fully ready with GL context
async function waitForCesiumReady(viewer: Cesium.Viewer): Promise<boolean> {
  // wait up to ~5s in 100ms steps for scene + context
  for (let i = 0; i < 50; i++) {
    if (viewer?.scene && (viewer.scene as any).context?._gl) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

const CesiumIonSDKViewshedAnalysis: React.FC<
  CesiumIonSDKViewshedAnalysisProps
> = ({ position, observationProperties, objectId: _objectId }) => {
  const { cesiumViewer } = useSceneStore();
  const sensorRef = useRef<any>(null);
  const viewshedRef = useRef<Cesium.Entity | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sdkAvailable, setSdkAvailable] = useState(true);

  // Initialize Ion SDK modules
  const initializeIonSDK = useCallback(async () => {
    if (!cesiumViewer || isInitialized) return;

    try {
      const ready = await waitForCesiumReady(cesiumViewer);
      if (!ready) throw new Error("Cesium GL context not ready");

      // If the device can't support viewshed, don't even init viewshed-related modules
      const okForViewshed = canSupportViewshed(cesiumViewer);

      try {
        const initSensors = (IonSensors as any).initializeSensors;
        if (
          okForViewshed &&
          typeof initSensors === "function" &&
          !window.__ionSensorsInit
        ) {
          await initSensors();
          window.__ionSensorsInit = true;
          console.log("✅ Ion SDK sensors initialized");
        } else if (!okForViewshed) {
          console.warn(
            "ℹ️ Viewshed unsupported on this device; skipping Ion sensors init"
          );
        }

        const initGeometry = (IonGeometry as any).initializeGeometry;
        if (
          okForViewshed &&
          typeof initGeometry === "function" &&
          !window.__ionGeometryInit
        ) {
          await initGeometry();
          window.__ionGeometryInit = true;
          console.log("✅ Ion SDK geometry initialized");
        }

        setSdkAvailable(okForViewshed); // ← expose capability to the component
        setIsInitialized(true);
      } catch (e: any) {
        console.error("❌ Ion SDK init failed:", e?.message || e);
        setSdkAvailable(false);
        setIsInitialized(true);
      }
    } catch (err) {
      console.error("❌ Failed to initialize Ion SDK modules:", err);
      setSdkAvailable(false);
      setIsInitialized(true); // Set to true to prevent retries

      // Only show error toast on mobile if it's a critical error
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (!isMobile || err.message.includes("Cesium not available")) {
        toast.error("Failed to initialize Ion SDK modules", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        console.warn(
          "⚠️ Ion SDK initialization failed on mobile, continuing without viewshed analysis"
        );
      }
    }
  }, [cesiumViewer, isInitialized]);

  useEffect(() => {
    initializeIonSDK();
  }, [initializeIonSDK]);

  // Create professional sensor using Ion SDK

  const createIonSDKSensor = useCallback(() => {
    console.log("🔍 createIonSDKSensor called", {
      isInitialized,
      cesiumViewer: !!cesiumViewer,
    });

    if (!isInitialized || !cesiumViewer) {
      // Ion SDK not loaded, skipping sensor creation
      console.log("🔍 Skipping sensor creation - not initialized or no viewer");
      return;
    }

    if (!sdkAvailable) {
      console.log("🔍 Skipping sensor creation - Ion SDK not available");
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

    // Always create sensor for viewshed analysis, but control visibility of geometry
    console.log(
      "🔍 showSensorGeometry:",
      observationProperties.showSensorGeometry
    );
    console.log("🔍 showViewshed:", observationProperties.showViewshed);

    try {
      const [longitude, latitude, height] = position;

      // Get the model entity
      const modelEntityId = `model-${_objectId}`;
      const modelEntity = cesiumViewer.entities.getById(modelEntityId);

      // Get model quaternion
      const modelQuaternion = getModelQuaternionAtNow(
        cesiumViewer,
        modelEntity
      );

      if (!modelQuaternion) {
        console.error("❌ Could not get model quaternion");
        return;
      }

      // Choose axes from props with defaults:
      const sensorForwardAxis = observationProperties.sensorForwardAxis ?? "X+";
      const modelFrontAxis = observationProperties.modelFrontAxis ?? "Z+";

      // Compute local offset that rotates sensor-forward → model-front
      const localOffsetQuat = quatFromTwoVectors(
        axisToVector(sensorForwardAxis),
        axisToVector(modelFrontAxis)
      );

      // Apply configurable tilt
      const tilt = Cesium.Quaternion.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(
          0,
          Cesium.Math.toRadians(observationProperties.tiltDeg ?? -10),
          0
        )
      );
      // final local offset = alignment * tilt
      const finalLocalOffset = Cesium.Quaternion.multiply(
        localOffsetQuat,
        tilt,
        new Cesium.Quaternion()
      );

      // Build sensor model matrix using helper function
      const modelMatrix = buildSensorModelMatrix(
        [longitude, latitude, height],
        modelQuaternion,
        finalLocalOffset
      );

      console.log("🔍 Built sensor model matrix with axis alignment:", {
        modelQuaternion: {
          x: modelQuaternion.x.toFixed(4),
          y: modelQuaternion.y.toFixed(4),
          z: modelQuaternion.z.toFixed(4),
          w: modelQuaternion.w.toFixed(4),
        },
        axisMapping: {
          sensorForwardAxis,
          modelFrontAxis,
          tiltDeg: observationProperties.tiltDeg ?? -10,
          note: `sensor ${sensorForwardAxis} → model ${modelFrontAxis} alignment`,
        },
        localOffsetQuat: {
          x: localOffsetQuat.x.toFixed(4),
          y: localOffsetQuat.y.toFixed(4),
          z: localOffsetQuat.z.toFixed(4),
          w: localOffsetQuat.w.toFixed(4),
        },
        finalLocalOffset: {
          x: finalLocalOffset.x.toFixed(4),
          y: finalLocalOffset.y.toFixed(4),
          z: finalLocalOffset.z.toFixed(4),
          w: finalLocalOffset.w.toFixed(4),
          note: "includes -10° tilt",
        },
      });

      // 4) Validate model matrix (avoid NaNs/Infs)
      const sensorPosition = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
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

      // Build a semi-transparent color material for the primitive surfaces
      const transparentSensorColor = sensorColor.withAlpha(0.3); // Make cone semi-transparent
      const sensorMat = Cesium.Material.fromType("Color", {
        color: transparentSensorColor,
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
        showViewshed: false, // We'll set this dynamically after sensor creation

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
        // For rectangular sensors, use smaller half angles (typically 1/4 to 1/3 of FOV)
        const xHalfDegrees =
          (observationProperties.fovH ?? observationProperties.fov ?? 60) *
          0.25;
        const yHalfDegrees =
          (observationProperties.fovV ??
            (observationProperties.fov ?? 60) * 0.6) * 0.25;

        // Ensure half angles don't exceed 90 degrees
        if (xHalfDegrees > 90 || yHalfDegrees > 90) {
          console.error("❌ Rectangular sensor half angles too large:", {
            xHalfDegrees,
            yHalfDegrees,
          });
          return;
        }

        const xHalf = Cesium.Math.toRadians(xHalfDegrees);
        const yHalf = Cesium.Math.toRadians(yHalfDegrees);
        sensor = new RectangularSensor({
          ...baseOptions,
          xHalfAngle: xHalf,
          yHalfAngle: yHalf,
        });
      } else {
        const fov = observationProperties.fov ?? 60;
        if (!Number.isFinite(fov) || fov <= 0 || fov > 360) {
          console.error("❌ Invalid FOV:", fov);
          return;
        }

        // Warn about very wide FOV values
        if (fov > 180) {
          console.warn(
            `⚠️ Very wide FOV: ${fov}° (${fov > 270 ? "nearly full sphere" : "wider than hemisphere"})`
          );
        }
        sensor = new ConicSensor({
          ...baseOptions,
          outerHalfAngle: Cesium.Math.toRadians(fov / 2),
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

        // Sanity check: try a bright color to rule out lighting issues
        // const visible = Cesium.Color.LIME.withAlpha(1.0); // uncomment to test

        // 1) Set viewshed based on observation properties and device capability
        sensor.showViewshed =
          !!observationProperties.showViewshed && sdkAvailable;

        // 2) Show/hide cone geometry based on showSensorGeometry setting
        sensor.showLateralSurfaces = !!observationProperties.showSensorGeometry;
        sensor.showDomeSurfaces = !!observationProperties.showSensorGeometry;

        // 3) Apply viewshed colors only if viewshed is enabled
        if (observationProperties.showViewshed) {
          sensor.viewshedVisibleColor = visible;
          sensor.viewshedOccludedColor = occluded;
        }

        // 4) (Optional) Also hide environment overlay passes if they wash things out white
        sensor.showEnvironmentOcclusion = false;
        sensor.showEnvironmentIntersection = false;
        sensor.showIntersection = false;

        // 5) Force a draw
        cesiumViewer.scene.requestRender();

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
        message: err.message,
        stack: err.stack,
        position,
        observationProperties,
      });
      toast.error(`Failed to create sensor: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [
    isInitialized,
    cesiumViewer,
    position,
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    observationProperties.showViewshed,
    observationProperties.viewshedColor,
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

    // Gate viewshed usage - if SDK not available, create sensor geometry only
    if (!sdkAvailable) {
      console.log(
        "🔍 Creating sensor geometry only (viewshed not supported on this device)"
      );
      createIonSDKSensor();
      return;
    }

    // Ensure sensor exists for viewshed analysis
    if (!sensorRef.current) {
      console.log("🔍 Creating sensor for viewshed analysis");
      createIonSDKSensor();
    }

    setIsCalculating(true);

    try {
      // Ion SDK handles viewshed automatically when showViewshed is enabled
      // The viewshed visualization is handled by the sensor itself
      // No additional computation or toast warnings needed

      console.log("✅ Viewshed analysis enabled - handled by Ion SDK sensor");

      // Viewshed is automatically rendered by the sensor when showViewshed: true
      // No need for additional entities or warnings
    } catch (err) {
      // Only show error for actual failures, not for normal operation
      console.error("Error in viewshed analysis:", err);
    } finally {
      setIsCalculating(false);
    }
  }, [
    isInitialized,
    cesiumViewer,
    observationProperties.showViewshed,
    createIonSDKSensor,
  ]);

  // Note: Measurements are handled by the TransformEditor component

  // Update sensor pose every frame via postRender (smooth real-time updates)
  useEffect(() => {
    if (!isInitialized || !sensorRef.current || !cesiumViewer) return;

    const [lon, lat, h] = position;
    const modelEntity = cesiumViewer.entities.getById(`model-${_objectId}`);
    if (!modelEntity) return;

    // compute once, reuse every frame
    const sensorForwardAxis = observationProperties.sensorForwardAxis ?? "X+";
    const modelFrontAxis = observationProperties.modelFrontAxis ?? "Z+";
    const localOffsetQuat = quatFromTwoVectors(
      axisToVector(sensorForwardAxis),
      axisToVector(modelFrontAxis)
    );
    const tilt = Cesium.Quaternion.fromHeadingPitchRoll(
      new Cesium.HeadingPitchRoll(
        0,
        Cesium.Math.toRadians(observationProperties.tiltDeg ?? -10),
        0
      )
    );
    const finalLocalOffset = Cesium.Quaternion.multiply(
      localOffsetQuat,
      tilt,
      new Cesium.Quaternion()
    );

    const update = () => {
      const q = getModelQuaternionAtNow(cesiumViewer, modelEntity);
      if (!q || !sensorRef.current) return;
      sensorRef.current.modelMatrix = buildSensorModelMatrix(
        [lon, lat, h],
        q,
        finalLocalOffset
      );
    };

    const remove = cesiumViewer.scene.postRender.addEventListener(update);
    return () => {
      remove && remove();
    };
  }, [isInitialized, cesiumViewer, position, _objectId]);

  // Create sensor when shape/visibility properties change
  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [
    isInitialized,
    cesiumViewer,
    position, // include only if origin may move
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    observationProperties.include3DModels,
    observationProperties.modelFrontAxis,
    observationProperties.sensorForwardAxis,
    observationProperties.tiltDeg,
  ]);

  // Transform editor removed to prevent issues

  // Perform viewshed analysis when showViewshed property changes
  useEffect(() => {
    if (!isInitialized) return;

    // Only run viewshed analysis if it's explicitly enabled
    if (observationProperties.showViewshed) {
      performViewshedAnalysis();
    } else {
      // Clear any existing viewshed when disabled
      if (viewshedRef.current) {
        cesiumViewer?.entities.remove(viewshedRef.current);
        viewshedRef.current = null;
      }
    }
  }, [
    isInitialized,
    observationProperties.showViewshed,
    observationProperties.viewshedColor,
    observationProperties.analysisQuality,
  ]);

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

    return () => {
      delete (window as any).toggleSensorGeometry;
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

  // Show fallback message if SDK is not available
  if (isInitialized && !sdkAvailable) {
    return (
      <div
        style={{
          position: "fixed",
          top: "80px",
          left: "20px",
          background: "rgba(255, 165, 0, 0.9)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        Viewshed analysis not supported on this device (sensor geometry only)
      </div>
    );
  }

  return null; // This component doesn't render anything visible
};

export default CesiumIonSDKViewshedAnalysis;
