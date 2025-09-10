"use client";

import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import useSceneStore from "../../hooks/useSceneStore";

const ViewshedDebugPanel: React.FC = () => {
  const { selectedObject, cesiumViewer } = useSceneStore();

  const logDebugInfo = () => {
    console.log("=== VIEWSHED DEBUG INFO ===");
    console.log("Selected Object:", selectedObject);
    console.log("Is Observation Model:", selectedObject?.isObservationModel);
    console.log(
      "Observation Properties:",
      selectedObject?.observationProperties
    );
    console.log("CesiumViewer available:", !!cesiumViewer);
    console.log(
      "CesiumViewer entities count:",
      cesiumViewer?.entities?.values?.length || 0
    );

    if (cesiumViewer?.entities) {
      const entities = cesiumViewer.entities.values;
      console.log(
        "All entities:",
        entities.map((e) => ({ id: e.id, name: e.name }))
      );
    }
  };

  const testSensorCreation = () => {
    if (!cesiumViewer) {
      console.log("No CesiumViewer available");
      return;
    }

    // Import the SDK dynamically to test
    import("../../utils/CesiumSDK")
      .then(({ Sensors }) => {
        console.log("Testing sensor creation...");

        const testSensor = Sensors.createCone(cesiumViewer, {
          id: "test-sensor",
          position: cesiumViewer.camera.position,
          heading: 0,
          pitch: 0,
          roll: 0,
          fov: Math.PI / 4, // 45 degrees
          range: 1000,
          color: { red: 0, green: 1, blue: 0, alpha: 0.3 },
        });

        console.log("Test sensor created:", testSensor);
      })
      .catch((err) => {
        console.error("Error importing SDK:", err);
      });
  };

  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Viewshed Debug Panel
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Selected Object: {selectedObject?.id || "None"}
        </Typography>
        <Typography variant="body2">
          Is Observation Model:{" "}
          {selectedObject?.isObservationModel ? "Yes" : "No"}
        </Typography>
        <Typography variant="body2">
          Has Observation Properties:{" "}
          {selectedObject?.observationProperties ? "Yes" : "No"}
        </Typography>
        <Typography variant="body2">
          CesiumViewer Available: {cesiumViewer ? "Yes" : "No"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
        <Button variant="outlined" onClick={logDebugInfo}>
          Log Debug Info
        </Button>
        <Button variant="outlined" onClick={testSensorCreation}>
          Test Sensor Creation
        </Button>
      </Box>

      {selectedObject?.observationProperties && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Observation Properties:
          </Typography>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(selectedObject.observationProperties, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default ViewshedDebugPanel;
