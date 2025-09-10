"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import {
  Sensors,
  VisibilityEngine,
  TransformEditor,
  SensorType,
} from "../../utils/CesiumSDK";

interface CesiumViewshedExampleProps {
  objectId: string;
}

const CesiumViewshedExample: React.FC<CesiumViewshedExampleProps> = ({
  objectId,
}) => {
  const { cesiumViewer, selectedObject } = useSceneStore();
  const [sensorType, setSensorType] = useState<SensorType>("cone");
  const [fov, setFov] = useState(90);
  const [radius, setRadius] = useState(1000);
  const [isAnalysisActive, setIsAnalysisActive] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Refs for cleanup
  const sensorEntityRef = useRef<Cesium.Entity | null>(null);
  const viewshedEntityRef = useRef<Cesium.Entity | null>(null);
  const transformEditorRef = useRef<TransformEditor | null>(null);
  const visibilityEngineRef = useRef<VisibilityEngine | null>(null);

  // Get object position and rotation
  const objectPosition = selectedObject?.position || [0, 0, 0];
  const objectRotation = selectedObject?.rotation || [0, 0, 0];

  // Clean up entities
  const cleanup = () => {
    if (cesiumViewer) {
      if (sensorEntityRef.current) {
        cesiumViewer.entities.remove(sensorEntityRef.current);
        sensorEntityRef.current = null;
      }
      if (viewshedEntityRef.current) {
        cesiumViewer.entities.remove(viewshedEntityRef.current);
        viewshedEntityRef.current = null;
      }
      if (transformEditorRef.current) {
        transformEditorRef.current.detach();
        transformEditorRef.current = null;
      }
    }
  };

  // Create sensor visualization
  const createSensor = () => {
    if (!cesiumViewer) return;

    cleanup();

    const [longitude, latitude, height] = objectPosition;
    const [heading, pitch, roll] = objectRotation;
    const fovRadians = Cesium.Math.toRadians(fov);

    let sensor: any = null;

    switch (sensorType) {
      case "cone":
        sensor = Sensors.createCone(cesiumViewer, {
          id: `sensor-${objectId}`,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
          heading: heading,
          pitch: pitch,
          roll: roll,
          fov: fovRadians,
          range: radius,
          color: Cesium.Color.LIME.withAlpha(0.3),
        });
        break;

      case "rectangle":
        sensor = Sensors.createRectangle(cesiumViewer, {
          id: `sensor-${objectId}`,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
          heading: heading,
          pitch: pitch,
          roll: roll,
          fovH: fovRadians,
          fovV: fovRadians * 0.6,
          range: radius,
          color: Cesium.Color.ORANGE.withAlpha(0.3),
        });
        break;

      case "dome":
        sensor = Sensors.createDome(cesiumViewer, {
          id: `sensor-${objectId}`,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
          heading: heading,
          pitch: pitch,
          roll: roll,
          maxPolar: fovRadians * 0.5,
          range: radius,
          color: Cesium.Color.CYAN.withAlpha(0.3),
        });
        break;
    }

    if (sensor) {
      sensorEntityRef.current = sensor.entity;

      // Create transform editor for the sensor
      if (!transformEditorRef.current) {
        transformEditorRef.current = new TransformEditor(cesiumViewer, {
          onChange: (trs) => {
            console.log("Transform changed:", trs);
            // Update the sensor position/rotation based on transform
          },
        });
        transformEditorRef.current.attachToEntity(sensor.entity);
      }
    }
  };

  // Perform viewshed analysis
  const performViewshedAnalysis = async () => {
    if (!cesiumViewer) return;

    setIsCalculating(true);
    cleanup();

    try {
      const [longitude, latitude, height] = objectPosition;
      const [heading, pitch, roll] = objectRotation;
      const fovRadians = Cesium.Math.toRadians(fov);

      // Initialize visibility engine
      if (!visibilityEngineRef.current) {
        visibilityEngineRef.current = new VisibilityEngine(cesiumViewer);
      }

      // Create sensor configuration
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

      // Viewshed options
      const viewshedOptions = {
        raysAzimuth: 180,
        raysElevation: 10,
        clearance: 2.0,
        stepCount: 64,
        material: Cesium.Color.DODGERBLUE.withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.YELLOW,
        clampToGround: true,
      };

      // Compute viewshed
      const result = await visibilityEngineRef.current.computeViewshed(
        sensorConfig,
        viewshedOptions
      );

      if (result.polygonEntity) {
        viewshedEntityRef.current = result.polygonEntity;
        setAnalysisResults({
          boundaryPoints: result.boundary.length,
          hasVisibleArea: result.boundary.length > 0,
        });
      }

      console.log("Viewshed analysis complete:", result);
    } catch (error) {
      console.error("Viewshed analysis failed:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Effect to create sensor when parameters change
  useEffect(() => {
    if (isAnalysisActive) {
      createSensor();
    } else {
      cleanup();
    }

    return cleanup;
  }, [
    sensorType,
    fov,
    radius,
    isAnalysisActive,
    objectPosition,
    objectRotation,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: 1000,
        minWidth: "300px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
        Viewshed Analysis Example
      </h3>

      {/* Sensor Type Selection */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Sensor Type:
        </label>
        <select
          value={sensorType}
          onChange={(e) => setSensorType(e.target.value as SensorType)}
          style={{
            width: "100%",
            padding: "4px",
            borderRadius: "4px",
            background: "white",
            color: "black",
          }}
        >
          <option value="cone">Cone</option>
          <option value="rectangle">Rectangle</option>
          <option value="dome">Dome</option>
        </select>
      </div>

      {/* FOV Slider */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Field of View: {fov}°
        </label>
        <input
          type="range"
          min="10"
          max="360"
          value={fov}
          onChange={(e) => setFov(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Radius Slider */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Range: {radius}m
        </label>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          onClick={() => setIsAnalysisActive(!isAnalysisActive)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "none",
            background: isAnalysisActive ? "#f44336" : "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isAnalysisActive ? "Hide Sensor" : "Show Sensor"}
        </button>
        <button
          onClick={performViewshedAnalysis}
          disabled={isCalculating}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "none",
            background: isCalculating ? "#666" : "#2196F3",
            color: "white",
            cursor: isCalculating ? "not-allowed" : "pointer",
          }}
        >
          {isCalculating ? "Calculating..." : "Calculate Viewshed"}
        </button>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <div>Boundary Points: {analysisResults.boundaryPoints}</div>
          <div>
            Status:{" "}
            {analysisResults.hasVisibleArea
              ? "Visible area found"
              : "No visible area"}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: "12px",
          fontSize: "11px",
          color: "#ccc",
          lineHeight: "1.4",
        }}
      >
        <div>• Adjust parameters and click "Show Sensor" to visualize</div>
        <div>• Click "Calculate Viewshed" to perform terrain analysis</div>
        <div>• Use transform gizmo to move/rotate the sensor</div>
      </div>
    </div>
  );
};

export default CesiumViewshedExample;
