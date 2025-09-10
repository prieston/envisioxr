"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import { Sensors, VisibilityEngine, SensorType } from "../../utils/CesiumSDK";

interface CesiumAdvancedViewshedAnalysisProps {
  position: [number, number, number]; // [longitude, latitude, height]
  rotation: [number, number, number]; // [heading, pitch, roll] in radians
  fov: number; // Field of view in degrees
  radius: number; // Visibility radius in meters
  showViewshed: boolean;
  showCone: boolean;
  objectId: string;
  sensorType?: SensorType; // Optional sensor type override
  analysisQuality?: "low" | "medium" | "high"; // Analysis quality setting
}

const CesiumAdvancedViewshedAnalysis: React.FC<
  CesiumAdvancedViewshedAnalysisProps
> = ({
  position,
  rotation,
  fov,
  radius,
  showViewshed,
  showCone,
  objectId,
  sensorType = "cone",
  analysisQuality = "medium",
}) => {
  const { cesiumViewer, cesiumInstance } = useSceneStore();
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<{
    visibleArea: number;
    totalArea: number;
    visibilityPercentage: number;
  } | null>(null);

  // Refs for cleanup
  const coneEntityRef = useRef<Cesium.Entity | null>(null);
  const viewshedEntityRef = useRef<Cesium.Entity | null>(null);
  const visibilityEngineRef = useRef<VisibilityEngine | null>(null);

  // Quality settings
  const qualitySettings = {
    low: { raysAzimuth: 60, raysElevation: 4, stepCount: 32 },
    medium: { raysAzimuth: 120, raysElevation: 8, stepCount: 64 },
    high: { raysAzimuth: 240, raysElevation: 16, stepCount: 128 },
  };

  // Clean up entities
  const cleanupEntities = useCallback(() => {
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
  }, [cesiumViewer]);

  // Create sensor visualization using SDK
  const createSensorVisualization = useCallback(() => {
    if (!cesiumViewer || !showCone) return;

    cleanupEntities();

    try {
      const [longitude, latitude, height] = position;
      const [heading, pitch, roll] = rotation;

      // Convert degrees to radians for FOV
      const fovRadians = Cesium.Math.toRadians(fov);

      let sensorEntity: any = null;

      // Create sensor based on type
      switch (sensorType) {
        case "cone":
          sensorEntity = Sensors.createCone(cesiumViewer, {
            id: `viewshed-cone-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            fov: fovRadians,
            range: radius,
            color: Cesium.Color.LIME.withAlpha(0.25),
          });
          break;

        case "rectangle":
          sensorEntity = Sensors.createRectangle(cesiumViewer, {
            id: `viewshed-rect-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            fovH: fovRadians,
            fovV: fovRadians * 0.6, // Make it more rectangular
            range: radius,
            color: Cesium.Color.ORANGE.withAlpha(0.25),
          });
          break;

        case "dome":
          sensorEntity = Sensors.createDome(cesiumViewer, {
            id: `viewshed-dome-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            maxPolar: fovRadians * 0.5, // Half the FOV for dome
            range: radius,
            color: Cesium.Color.CYAN.withAlpha(0.25),
          });
          break;

        default:
          // Fallback to cone
          sensorEntity = Sensors.createCone(cesiumViewer, {
            id: `viewshed-cone-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            fov: fovRadians,
            range: radius,
            color: Cesium.Color.LIME.withAlpha(0.25),
          });
      }

      coneEntityRef.current = sensorEntity.entity;
    } catch (err) {
      console.error("Error creating sensor visualization:", err);
      setError("Failed to create sensor visualization");
    }
  }, [
    cesiumViewer,
    showCone,
    position,
    rotation,
    fov,
    radius,
    objectId,
    sensorType,
    cleanupEntities,
  ]);

  // Perform viewshed analysis using SDK
  const performViewshedAnalysis = useCallback(async () => {
    if (!cesiumViewer || !showViewshed) return;

    setIsCalculating(true);
    setError(null);
    setProgress(0);
    setAnalysisResults(null);
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

      // Get quality settings
      const quality = qualitySettings[analysisQuality];

      // Create sensor configuration based on type
      let sensorConfig: any = {
        type: sensorType,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        heading: heading,
        pitch: pitch,
        roll: roll,
        range: radius,
      };

      // Add type-specific properties
      switch (sensorType) {
        case "cone":
          sensorConfig.fov = fovRadians;
          break;
        case "rectangle":
          sensorConfig.fovH = fovRadians;
          sensorConfig.fovV = fovRadians * 0.6;
          break;
        case "dome":
          sensorConfig.maxPolar = fovRadians * 0.5;
          break;
      }

      // Viewshed options based on quality
      const viewshedOptions = {
        raysAzimuth: quality.raysAzimuth,
        raysElevation: quality.raysElevation,
        clearance: 2.0,
        stepCount: quality.stepCount,
        material: Cesium.Color.DODGERBLUE.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.YELLOW,
        clampToGround: true,
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Compute viewshed using SDK
      const result = await visibilityEngineRef.current.computeViewshed(
        sensorConfig,
        viewshedOptions
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (result.polygonEntity) {
        viewshedEntityRef.current = result.polygonEntity;

        // Calculate analysis results
        const visibleArea = calculatePolygonArea(result.boundary);
        const totalArea = Math.PI * radius * radius; // Circular area
        const visibilityPercentage = (visibleArea / totalArea) * 100;

        setAnalysisResults({
          visibleArea,
          totalArea,
          visibilityPercentage,
        });

        console.log(
          `Viewshed analysis complete: ${result.boundary.length} boundary points, ${visibilityPercentage.toFixed(1)}% visibility`
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
      setProgress(0);
    }
  }, [
    cesiumViewer,
    showViewshed,
    position,
    rotation,
    fov,
    radius,
    objectId,
    sensorType,
    analysisQuality,
    cleanupEntities,
  ]);

  // Calculate polygon area (simplified)
  const calculatePolygonArea = (points: Cesium.Cartesian3[]): number => {
    if (points.length < 3) return 0;

    // Convert to cartographic coordinates for area calculation
    const cartographicPoints = points.map((point) =>
      Cesium.Cartographic.fromCartesian(point)
    );

    // Simple area calculation (not perfectly accurate but good enough for display)
    let area = 0;
    for (let i = 0; i < cartographicPoints.length; i++) {
      const j = (i + 1) % cartographicPoints.length;
      area += cartographicPoints[i].longitude * cartographicPoints[j].latitude;
      area -= cartographicPoints[j].longitude * cartographicPoints[i].latitude;
    }
    area = Math.abs(area) / 2;

    // Convert to square meters (rough approximation)
    return area * 111000 * 111000; // 1 degree ≈ 111km
  };

  // Effect for sensor visualization
  useEffect(() => {
    if (showCone) {
      createSensorVisualization();
    } else {
      if (coneEntityRef.current) {
        cleanupEntities();
      }
    }

    return cleanupEntities;
  }, [showCone, createSensorVisualization, cleanupEntities]);

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
  }, [showViewshed, performViewshedAnalysis, cleanupEntities]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEntities();
    };
  }, [cleanupEntities]);

  // Show loading state with progress
  if (isCalculating) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 1000,
          minWidth: "200px",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          Calculating viewshed... ({progress}%)
        </div>
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
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
          background: "rgba(255, 0, 0, 0.8)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 1000,
          maxWidth: "300px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Error</div>
        <div>{error}</div>
      </div>
    );
  }

  // Show analysis results
  if (analysisResults && !isCalculating) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 1000,
          minWidth: "200px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Viewshed Analysis Results
        </div>
        <div style={{ marginBottom: "4px" }}>
          Visible Area: {(analysisResults.visibleArea / 1000).toFixed(1)}k m²
        </div>
        <div style={{ marginBottom: "4px" }}>
          Total Area: {(analysisResults.totalArea / 1000).toFixed(1)}k m²
        </div>
        <div style={{ color: "#4CAF50", fontWeight: "bold" }}>
          Visibility: {analysisResults.visibilityPercentage.toFixed(1)}%
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything visible
};

export default CesiumAdvancedViewshedAnalysis;
