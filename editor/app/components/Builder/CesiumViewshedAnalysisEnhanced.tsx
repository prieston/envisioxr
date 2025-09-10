"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import { Sensors, VisibilityEngine } from "../../utils/CesiumSDK";

interface CesiumViewshedAnalysisEnhancedProps {
  position: [number, number, number]; // [longitude, latitude, height]
  rotation: [number, number, number]; // [heading, pitch, roll] in radians
  fov: number; // Field of view in degrees
  radius: number; // Visibility radius in meters
  showViewshed: boolean;
  showCone: boolean;
  objectId: string;
}

const CesiumViewshedAnalysisEnhanced: React.FC<
  CesiumViewshedAnalysisEnhancedProps
> = ({ position, rotation, fov, radius, showViewshed, showCone, objectId }) => {
  const { cesiumViewer, cesiumInstance } = useSceneStore();
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const coneEntityRef = useRef<Cesium.Entity | null>(null);
  const viewshedEntityRef = useRef<Cesium.Entity | null>(null);
  const visibilityEngineRef = useRef<VisibilityEngine | null>(null);

  // Clean up entities
  const cleanupEntities = () => {
    if (cesiumViewer) {
      if (coneEntityRef.current) {
        cesiumViewer.entities.remove(coneEntityRef.current);
        coneEntityRef.current = null;
      }
      if (viewshedEntityRef.current) {
        cesiumViewer.entities.remove(viewshedEntityRef.current);
        viewshedEntityRef.current = null;
      }
    }
  };

  // Create cone visualization using SDK
  const createConeVisualization = () => {
    if (!cesiumViewer || !showCone) return;

    cleanupEntities();

    try {
      const [longitude, latitude, height] = position;
      const [heading, pitch, roll] = rotation;

      // Convert degrees to radians for FOV
      const fovRadians = Cesium.Math.toRadians(fov);

      // Create cone sensor using SDK
      const coneSensor = Sensors.createCone(cesiumViewer, {
        id: `viewshed-cone-${objectId}`,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        heading: heading,
        pitch: pitch,
        roll: roll,
        fov: fovRadians,
        range: radius,
        color: Cesium.Color.LIME.withAlpha(0.25),
      });

      coneEntityRef.current = coneSensor.entity;
    } catch (err) {
      console.error("Error creating cone visualization:", err);
      setError("Failed to create cone visualization");
    }
  };

  // Perform viewshed analysis using SDK
  const performViewshedAnalysis = async () => {
    if (!cesiumViewer || !showViewshed) return;

    setIsCalculating(true);
    setError(null);
    cleanupEntities();

    try {
      const [longitude, latitude, height] = position;
      const [heading, pitch, roll] = rotation;

      // Convert degrees to radians for FOV
      const fovRadians = Cesium.Math.toRadians(fov);

      // Initialize visibility engine
      if (!visibilityEngineRef.current) {
        visibilityEngineRef.current = new VisibilityEngine(cesiumViewer);
      }

      // Create cone sensor configuration
      const sensorConfig = {
        type: "cone" as const,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        heading: heading,
        pitch: pitch,
        roll: roll,
        range: radius,
        fov: fovRadians,
      };

      // Viewshed options for better performance and accuracy
      const viewshedOptions = {
        raysAzimuth: 120, // Number of azimuth samples
        raysElevation: 8, // Number of elevation slices
        clearance: 2.0, // Clearance above terrain
        stepCount: 64, // Samples per ray
        material: Cesium.Color.DODGERBLUE.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.YELLOW,
        clampToGround: true,
      };

      // Compute viewshed using SDK
      const result = await visibilityEngineRef.current.computeViewshed(
        sensorConfig,
        viewshedOptions
      );

      if (result.polygonEntity) {
        viewshedEntityRef.current = result.polygonEntity;
        console.log(
          `Viewshed analysis complete: ${result.boundary.length} boundary points`
        );
      } else {
        console.warn("No visible area found in viewshed analysis");
        setError("No visible area found - terrain may be blocking all views");
      }
    } catch (err) {
      console.error("Error performing viewshed analysis:", err);
      setError("Failed to perform viewshed analysis");
    } finally {
      setIsCalculating(false);
    }
  };

  // Effect for cone visualization
  useEffect(() => {
    if (showCone) {
      createConeVisualization();
    } else {
      if (coneEntityRef.current) {
        cleanupEntities();
      }
    }

    return cleanupEntities;
  }, [showCone, position, rotation, fov, radius, objectId]);

  // Effect for viewshed analysis
  useEffect(() => {
    if (showViewshed) {
      performViewshedAnalysis();
    } else {
      if (viewshedEntityRef.current) {
        cleanupEntities();
      }
    }

    return cleanupEntities;
  }, [showViewshed, position, rotation, fov, radius, objectId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEntities();
    };
  }, []);

  // Show loading state
  if (isCalculating) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        Calculating viewshed...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(255, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        {error}
      </div>
    );
  }

  return null; // This component doesn't render anything visible
};

export default CesiumViewshedAnalysisEnhanced;
