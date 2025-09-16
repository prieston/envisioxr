"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import CesiumIonSDK from "../../utils/CesiumIonSDK";
import { toast } from "react-toastify";

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
    enableTransformEditor: boolean;
    gizmoMode?: "translate" | "rotate" | "scale";
    include3DModels?: boolean;
  };
  objectId: string;
}

const CesiumIonSDKViewshedAnalysis: React.FC<
  CesiumIonSDKViewshedAnalysisProps
> = ({ position, rotation, observationProperties, objectId: _objectId }) => {
  const { cesiumViewer } = useSceneStore();
  const ionSDKRef = useRef<CesiumIonSDK | null>(null);
  const sensorRef = useRef<any>(null);
  const viewshedRef = useRef<Cesium.Entity | null>(null);
  const transformEditorRef = useRef<any>(null);
  const sensorEntityRef = useRef<Cesium.Entity | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize Ion SDK
  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;

    const initializeIonSDK = async () => {
      try {
        const ionSDK = new CesiumIonSDK(cesiumViewer);
        await ionSDK.initialize();
        ionSDKRef.current = ionSDK;
        setIsInitialized(true);
        console.log("✅ Ion SDK initialized for viewshed analysis");
      } catch (err) {
        console.error("❌ Failed to initialize Ion SDK:", err);
        toast.error("Failed to initialize Ion SDK", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    initializeIonSDK();
  }, [cesiumViewer, isInitialized]);

  // Create professional sensor using Ion SDK
  const createIonSDKSensor = useCallback(() => {
    if (!ionSDKRef.current) {
      console.log("🔍 Ion SDK not loaded, skipping sensor creation");
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
    if (sensorEntityRef.current) {
      cesiumViewer?.entities.remove(sensorEntityRef.current);
      sensorEntityRef.current = null;
    }

    // If showSensorGeometry is false, just return (sensor is already removed)
    if (!observationProperties.showSensorGeometry) {
      console.log("🔍 Sensor geometry disabled, sensor removed");
      return;
    }

    try {
      const [longitude, latitude, height] = position;
      const [heading, pitch, roll] = rotation;

      const sensorPosition = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      const sensorOrientation = Cesium.Transforms.headingPitchRollQuaternion(
        sensorPosition,
        new Cesium.HeadingPitchRoll(heading, pitch, roll),
        Cesium.Ellipsoid.WGS84
      );

      const baseOptions = {
        position: sensorPosition,
        orientation: sensorOrientation,
        radius: observationProperties.visibilityRadius,
        color: observationProperties.sensorColor
          ? Cesium.Color.fromCssColorString(observationProperties.sensorColor)
          : Cesium.Color.CYAN,
        showLateralSurfaces: true,
        showDomeSurfaces: true,
        showViewshed: observationProperties.showViewshed,
        environmentConstraint: true,
        include3DModels: observationProperties.include3DModels !== false, // Use property setting, default to true
      };

      console.log("🔧 Creating Ion SDK sensor with options:", {
        sensorType: observationProperties.sensorType,
        fov: observationProperties.fov,
        radius: observationProperties.visibilityRadius,
      });

      let sensor: any = null;

      switch (observationProperties.sensorType) {
        case "rectangle": {
          const rectangularOptions = {
            ...baseOptions,
            xHalfAngle: Cesium.Math.toRadians(
              observationProperties.fovH || observationProperties.fov
            ),
            yHalfAngle: Cesium.Math.toRadians(
              observationProperties.fovV || observationProperties.fov * 0.6
            ),
          };
          sensor =
            ionSDKRef.current.createRectangularSensor(rectangularOptions);
          break;
        }
        case "cone": {
          const conicOptions = {
            ...baseOptions,
            fov: Cesium.Math.toRadians(observationProperties.fov),
          };
          sensor = ionSDKRef.current.createConicSensor(conicOptions);
          break;
        }
        default: {
          // Fallback to conic sensor
          const defaultOptions = {
            ...baseOptions,
            fov: Cesium.Math.toRadians(observationProperties.fov),
          };
          sensor = ionSDKRef.current.createConicSensor(defaultOptions);
        }
      }

      if (sensor) {
        sensorRef.current = sensor;
        console.log("✅ Ion SDK sensor created successfully:", sensor);

        // Create a clickable entity for the transform editor
        const [longitude, latitude, height] = position;
        const [heading, pitch, roll] = rotation;

        const sensorPosition = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        );
        const sensorOrientation = Cesium.Transforms.headingPitchRollQuaternion(
          sensorPosition,
          new Cesium.HeadingPitchRoll(heading, pitch, roll),
          Cesium.Ellipsoid.WGS84
        );

        // Remove existing sensor entity
        if (sensorEntityRef.current) {
          cesiumViewer?.entities.remove(sensorEntityRef.current);
        }

        // Create a clickable entity at the sensor position
        sensorEntityRef.current = cesiumViewer?.entities.add({
          position: sensorPosition,
          orientation: sensorOrientation,
          point: {
            pixelSize: 12,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
          },
          label: {
            text: "Click to Edit Sensor",
            font: "12pt sans-serif",
            pixelOffset: new Cesium.Cartesian2(0, -40),
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
          },
          // Make it pickable
          id: `sensor-gizmo-${_objectId}`,
        });

        console.log("✅ Clickable sensor entity created for transform editor");
      } else {
        console.warn("⚠️ Sensor creation returned null");
      }
    } catch (err) {
      console.error("❌ Error creating Ion SDK sensor:", err);
      toast.error("Failed to create sensor", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [
    ionSDKRef.current,
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
    if (!ionSDKRef.current || !observationProperties.showViewshed) {
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
      console.log("✅ Ion SDK sensor created with built-in viewshed analysis");

      // The viewshed is handled by the sensor itself via showViewshed: true
      // No additional computation needed
      const result = {
        polygonEntity: null, // Ion SDK handles this internally
        boundary: [],
      };

      if (result.polygonEntity) {
        viewshedRef.current = result.polygonEntity;
        console.log("✅ Professional viewshed analysis completed");
      } else {
        console.warn("❌ No visible area found in viewshed analysis");
        toast.warning(
          "No visible area found - terrain may be blocking all views",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }
    } catch (err) {
      console.error("❌ Error performing viewshed analysis:", err);
      toast.error("Failed to perform viewshed analysis", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsCalculating(false);
    }
  }, [
    ionSDKRef.current,
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

  // Enable professional measurements
  useEffect(() => {
    if (!ionSDKRef.current) return;

    try {
      // Enable measurements
      ionSDKRef.current.enableMeasurements();
      console.log("✅ Ion SDK measurements enabled");
    } catch (err) {
      console.error("❌ Error enabling measurements:", err);
    }
  }, [ionSDKRef.current]);

  // Create sensor when properties change
  useEffect(() => {
    if (!isInitialized) return;
    createIonSDKSensor();
  }, [
    isInitialized,
    createIonSDKSensor,
    observationProperties.showSensorGeometry,
  ]);

  // Create transform editor when sensor entity is created
  useEffect(() => {
    if (!isInitialized || !ionSDKRef.current || !sensorEntityRef.current)
      return;

    // Destroy existing transform editor
    if (transformEditorRef.current && ionSDKRef.current) {
      ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
    }

    console.log("🔧 Auto-creating transform editor for selected sensor");

    // Create transform editor automatically when sensor is selected
    transformEditorRef.current = ionSDKRef.current.createTransformEditor(
      sensorEntityRef.current,
      {
        axisLength: 20.0,
        gizmoPosition: "top",
        onChange: (trs: any) => {
          console.log("🔧 Auto-transform editor change:", trs);

          // Update the sensor primitive when the entity moves
          if (trs && trs.translation) {
            console.log("📍 Position updated:", trs.translation);

            // Convert to lat/lon/height
            const cartographic = Cesium.Cartographic.fromCartesian(
              trs.translation
            );
            const newLongitude = Cesium.Math.toDegrees(cartographic.longitude);
            const newLatitude = Cesium.Math.toDegrees(cartographic.latitude);
            const newHeight = cartographic.height;

            console.log(
              `📍 New position: [${newLongitude.toFixed(6)}, ${newLatitude.toFixed(6)}, ${newHeight.toFixed(2)}]`
            );

            // Recreate the sensor with new position
            createIonSDKSensor();
          }

          if (trs && trs.rotation) {
            console.log("🔄 Rotation updated:", trs.rotation);

            // Recreate the sensor with new rotation
            createIonSDKSensor();
          }
        },
      }
    );

    if (transformEditorRef.current) {
      console.log("✅ Auto-transform editor created successfully");
    } else {
      console.warn("⚠️ Failed to create auto-transform editor");
    }

    // Cleanup function
    return () => {
      if (transformEditorRef.current && ionSDKRef.current) {
        ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
        transformEditorRef.current = null;
      }
    };
  }, [
    isInitialized,
    ionSDKRef.current,
    sensorEntityRef.current,
    createIonSDKSensor,
  ]);

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
      if (sensorEntityRef.current) {
        cesiumViewer?.entities.remove(sensorEntityRef.current);
      }
      if (transformEditorRef.current && ionSDKRef.current) {
        ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
      }
      if (ionSDKRef.current) {
        ionSDKRef.current.destroy();
      }
    };
  }, [cesiumViewer]);

  // Expose toggle function globally for easy access
  useEffect(() => {
    (window as any).toggleSensorGeometry = () => {
      if (sensorRef.current) {
        if (sensorRef.current instanceof Cesium.Entity) {
          sensorRef.current.show = !sensorRef.current.show;
          console.log(
            `🔧 Sensor geometry ${sensorRef.current.show ? "shown" : "hidden"}`
          );
        } else {
          // For Ion SDK primitives, we need to remove/add them
          if (sensorRef.current.show) {
            cesiumViewer?.scene.primitives.remove(sensorRef.current);
            sensorRef.current.show = false;
            console.log("🔧 Sensor geometry hidden");
          } else {
            cesiumViewer?.scene.primitives.add(sensorRef.current);
            sensorRef.current.show = true;
            console.log("🔧 Sensor geometry shown");
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
