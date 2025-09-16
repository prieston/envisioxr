"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import CesiumIonSDK from "../../utils/CesiumIonSDK";

const IonSDKDemo: React.FC = () => {
  const { cesiumViewer } = useSceneStore();
  const ionSDKRef = useRef<CesiumIonSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePackages, setAvailablePackages] = useState<string[]>([]);

  useEffect(() => {
    if (!cesiumViewer) return;

    const initializeDemo = async () => {
      try {
        const ionSDK = new CesiumIonSDK(cesiumViewer);
        await ionSDK.initialize();
        ionSDKRef.current = ionSDK;
        setIsInitialized(true);
        setAvailablePackages(ionSDK.getAvailablePackages());
        console.log("✅ Ion SDK Demo initialized");
      } catch (err) {
        console.error("❌ Failed to initialize Ion SDK Demo:", err);
        setError("Failed to initialize Ion SDK Demo");
      }
    };

    initializeDemo();
  }, [cesiumViewer]);

  const createTestSensors = () => {
    if (!ionSDKRef.current || !cesiumViewer) return;

    try {
      // Create a rectangular sensor
      const rectPosition = Cesium.Cartesian3.fromDegrees(-74.0, 40.7, 1000);
      const rectOrientation = Cesium.Quaternion.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(0, -Math.PI / 4, 0)
      );

      const rectSensor = ionSDKRef.current.createRectangularSensor({
        position: rectPosition,
        orientation: rectOrientation,
        radius: 2000,
        xHalfAngle: Cesium.Math.toRadians(30),
        yHalfAngle: Cesium.Math.toRadians(20),
        color: Cesium.Color.CYAN,
        showLateralSurfaces: true,
        showDomeSurfaces: true,
      });

      // Create a conic sensor
      const conePosition = Cesium.Cartesian3.fromDegrees(-74.1, 40.8, 1500);
      const coneOrientation = Cesium.Quaternion.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(Math.PI / 4, -Math.PI / 6, 0)
      );

      const coneSensor = ionSDKRef.current.createConicSensor({
        position: conePosition,
        orientation: coneOrientation,
        radius: 3000,
        fov: Cesium.Math.toRadians(60),
        color: Cesium.Color.LIME,
        showLateralSurfaces: true,
        showDomeSurfaces: true,
      });

      console.log("✅ Enhanced test sensors created");
      console.log("📊 Rectangular sensor:", rectSensor);
      console.log("📊 Conic sensor:", coneSensor);
    } catch (err) {
      console.error("❌ Error creating test sensors:", err);
      setError("Failed to create test sensors");
    }
  };

  const enableMeasurements = () => {
    if (!ionSDKRef.current) return;

    try {
      ionSDKRef.current.enableMeasurements();
      console.log("✅ Measurements enabled");
    } catch (err) {
      console.error("❌ Error enabling measurements:", err);
      setError("Failed to enable measurements");
    }
  };

  const clearSensors = () => {
    if (!cesiumViewer) return;

    try {
      // Remove all primitives (this will remove Ion SDK sensors)
      cesiumViewer.scene.primitives.removeAll();
      console.log("✅ Sensors cleared");
    } catch (err) {
      console.error("❌ Error clearing sensors:", err);
    }
  };

  if (!isInitialized) {
    return (
      <div className="fixed top-4 right-4 bg-blue-900 text-white p-4 rounded-lg shadow-lg z-50">
        <h3 className="font-bold mb-2">Ion SDK Demo</h3>
        <p>Initializing Ion SDK...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-900 text-white p-4 rounded-lg shadow-lg z-50">
        <h3 className="font-bold mb-2">Ion SDK Demo Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Ion SDK Demo</h3>
      <p className="text-sm text-gray-300 mb-3">
        Available packages: {availablePackages.join(", ")}
      </p>

      <div className="space-y-2">
        <button
          onClick={createTestSensors}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
        >
          Create Test Sensors
        </button>

        <button
          onClick={enableMeasurements}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
        >
          Enable Measurements
        </button>

        <button
          onClick={clearSensors}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
        >
          Clear Sensors
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        <p>• Rectangular sensor: Cyan, 30°×20° FOV</p>
        <p>• Conic sensor: Lime, 60° FOV</p>
        <p>• Both have viewshed analysis enabled</p>
      </div>
    </div>
  );
};

export default IonSDKDemo;
