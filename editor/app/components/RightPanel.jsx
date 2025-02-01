// src/components/RightPanel.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import useSceneStore from "../hooks/useSceneStore";

const RightPanel = () => {
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const deleteObservationPoint = useSceneStore(
    (state) => state.deleteObservationPoint
  );
  const previewMode = useSceneStore((state) => state.previewMode);

  // 🔹 Local state for input fields to avoid direct Zustand modification
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");

  // 🔹 Sync local state when an observation point is selected
  useEffect(() => {
    if (selectedObservation) {
      setLocalTitle(selectedObservation.title || "");
      setLocalDescription(selectedObservation.description || "");
    }
  }, [selectedObservation]);

  // 🔹 Handle saving changes to Zustand when the user stops typing
  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
    updateObservationPoint(selectedObservation.id, { title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setLocalDescription(e.target.value);
    updateObservationPoint(selectedObservation.id, {
      description: e.target.value,
    });
  };

  if (!selectedObservation) {
    return (
      <Box
        sx={{
          width: "300px",
          height: "100%",
          backgroundColor: "background.paper",
          color: "text.primary",
          padding: 2,
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography>Select an observation point to edit</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "300px",
        height: "100%",
        backgroundColor: "background.paper",
        color: "text.primary",
        padding: 2,
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        userSelect: "none", // Prevent text selection

        // Disabled look & feel when the condition is active
        pointerEvents: previewMode ? "none" : "auto", // Disable interactivity when previewMode is true
        opacity: previewMode ? 0.5 : 1, // Dim the panel for a disabled appearance
        cursor: previewMode ? "not-allowed" : "default", // Change cursor to indicate non-interactivity
        filter: previewMode ? "grayscale(100%)" : "none", // Optionally add a grayscale effect
        transition: "opacity 0.3s ease, filter 0.3s ease", // Smooth transition when state changes
      }}
    >
      <Typography variant="h6">Edit Observation</Typography>

      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={localTitle}
        onChange={handleTitleChange}
      />

      <TextField
        label="Description"
        multiline
        rows={4}
        fullWidth
        margin="normal"
        value={localDescription}
        onChange={handleDescriptionChange}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ marginTop: 2 }}
        onClick={() => useSceneStore.getState().setCapturingPOV(true)}
      >
        Capture Camera POV
      </Button>

      <Button
        variant="contained"
        color="error"
        fullWidth
        sx={{ marginTop: 2 }}
        onClick={() => deleteObservationPoint(selectedObservation.id)}
      >
        Delete
      </Button>
    </Box>
  );
};

export default RightPanel;
