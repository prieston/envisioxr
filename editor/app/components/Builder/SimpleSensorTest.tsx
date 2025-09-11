"use client";

import React, { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import { Sensors } from "../../utils/CesiumSDK";

const SimpleSensorTest: React.FC = () => {
  const { cesiumViewer } = useSceneStore();
  const testEntityRef = useRef<Cesium.Entity | null>(null);

  useEffect(() => {
    if (!cesiumViewer) return;

    console.log("=== SIMPLE SENSOR TEST ===");
    console.log("CesiumViewer available:", !!cesiumViewer);
    console.log("CesiumViewer entities count:", cesiumViewer.entities.values.length);

    // Clean up any existing test entity
    if (testEntityRef.current) {
      cesiumViewer.entities.remove(testEntityRef.current);
    }

    try {
      // Create a simple test sensor
      const testSensor = Sensors.createCone(cesiumViewer, {
        id: "simple-test-sensor",
        position: Cesium.Cartesian3.fromDegrees(0, 0, 100), // Simple position
        heading: 0,
        pitch: 0,
        roll: 0,
        fov: Math.PI / 4, // 45 degrees
        range: 1000,
        color: Cesium.Color.RED.withAlpha(0.5),
      });

      console.log("Test sensor created:", testSensor);
      testEntityRef.current = testSensor.entity;
      console.log("Test sensor entity:", testSensor.entity);
      console.log("Test sensor entity show:", testSensor.entity.show);
      console.log("Test sensor entity cylinder:", testSensor.entity.cylinder);

    } catch (error) {
      console.error("Error creating test sensor:", error);
    }

    return () => {
      if (testEntityRef.current && cesiumViewer) {
        cesiumViewer.entities.remove(testEntityRef.current);
      }
    };
  }, [cesiumViewer]);

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 1000,
      }}
    >
      Simple Sensor Test - Check console for logs
    </div>
  );
};

export default SimpleSensorTest;
