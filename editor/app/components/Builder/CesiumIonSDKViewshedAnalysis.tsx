"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import useSceneStore from "../../hooks/useSceneStore";
import { toast } from "react-toastify";

// Use Cesium.Math from "cesium" everywhere

// Import monolithic Cesium for compatibility with Ion SDK
import * as Cesium from "cesium";

// Import Ion SDK modules directly
import { RectangularSensor, ConicSensor } from "@cesiumgs/ion-sdk-sensors";
import * as IonSensors from "@cesiumgs/ion-sdk-sensors";
import * as IonGeometry from "@cesiumgs/ion-sdk-geometry";

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
  };
  objectId: string;
}

const CesiumIonSDKViewshedAnalysis: React.FC<
  CesiumIonSDKViewshedAnalysisProps
> = ({ position, rotation, observationProperties, objectId: _objectId }) => {
  const { cesiumViewer } = useSceneStore();
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
          } catch (error) {
            if (
              error.message &&
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
          } catch (error) {
            if (
              error.message &&
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
    });

    if (!isInitialized || !cesiumViewer) {
      // Ion SDK not loaded, skipping sensor creation
      console.log("🔍 Skipping sensor creation - not initialized or no viewer");
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
      const [longitude, latitude, height] = position;
      const [heading, pitch, roll] = rotation;

      // 1) Build world position
      const sensorPosition = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );

      // 2) Build rotation from HPR
      const hpr = new Cesium.HeadingPitchRoll(
        heading || 0,
        pitch || 0,
        roll || 0
      );
      const rot = Cesium.Matrix3.fromHeadingPitchRoll(hpr);

      // 3) Build a *single* modelMatrix (rotation + translation)
      const modelMatrix = Cesium.Matrix4.fromRotationTranslation(
        rot,
        sensorPosition
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
        const xHalf = Cesium.Math.toRadians(
          observationProperties.fovH ?? observationProperties.fov ?? 60
        );
        const yHalf = Cesium.Math.toRadians(
          observationProperties.fovV ?? (observationProperties.fov ?? 60) * 0.6
        );
        sensor = new RectangularSensor({
          ...baseOptions,
          xHalfAngle: xHalf,
          yHalfAngle: yHalf,
        });
      } else {
        const fov = observationProperties.fov ?? 60;
        if (!Number.isFinite(fov) || fov <= 0 || fov >= 180) {
          console.error("❌ Invalid FOV:", fov);
          return;
        }
        sensor = new ConicSensor({
          ...baseOptions,
          fov: Cesium.Math.toRadians(fov),
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

        // 1) Ensure viewshed is actually used
        sensor.showViewshed = true;

        // 2) Apply colors via the public fields that your build exposes
        sensor.viewshedVisibleColor = visible;
        sensor.viewshedOccludedColor = occluded;

        // 3) Hide the base cone surfaces while using the viewshed shader,
        //    because your build draws separate "color command" passes that default to white.
        sensor.showLateralSurfaces = false;
        sensor.showDomeSurfaces = false;

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
        rotation,
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
    rotation,
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    observationProperties.showViewshed,
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

    const [longitude, latitude, height] = position;
    const [heading, pitch, roll] = rotation;

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
    const rot = Cesium.Matrix3.fromHeadingPitchRoll(hpr);
    const modelMatrix = Cesium.Matrix4.fromRotationTranslation(
      rot,
      sensorPosition
    );

    // Update sensor pose in place
    sensorRef.current.modelMatrix = modelMatrix;
    cesiumViewer?.scene.requestRender();
  }, [isInitialized, position, rotation, cesiumViewer]);

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

  return null; // This component doesn't render anything visible
};

export default CesiumIonSDKViewshedAnalysis;
