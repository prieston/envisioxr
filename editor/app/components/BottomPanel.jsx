// src/components/BottomPanel.jsx
"use client";

import React from "react";
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useSceneStore from "../hooks/useSceneStore";

const BottomPanel = () => {
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObservation = useSceneStore((state) => state.selectedObservation);
  const selectObservationPoint = useSceneStore((state) => state.selectObservationPoint);
  const addObservationPoint = useSceneStore((state) => state.addObservationPoint);
  const previewMode = useSceneStore((state) => state.previewMode);

  return (
    <Box
    sx={{
      width: "100%",
      height: "120px",
      backgroundColor: "background.paper",
      padding: 2,
      display: "flex",
      alignItems: "center",
      overflowX: "auto",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      pointerEvents: previewMode ? "none" : "auto", // Disables interaction in preview mode
      opacity: previewMode ? 0.5 : 1,             // Reduces opacity to signal disabled state
      cursor: previewMode ? "not-allowed" : "auto", // Changes the cursor when disabled
      // Optionally, add a grayscale filter for an even more "disabled" effect:
      filter: previewMode ? "grayscale(100%)" : "none",
      transition: "opacity 0.3s ease, filter 0.3s ease", // Smooth transition when state changes
      userSelect: "none", // Prevent text selection
    }}>
      {/* Add New Observation Button */}
      <Card
        sx={{
          minWidth: 150,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "1px dashed rgba(255, 255, 255, 0.5)",
          marginRight: 2,
          "&:hover": {
            border: "1px solid white",
          },
        }}
        onClick={addObservationPoint}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tooltip title="Add Observation Point">
            <IconButton color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">Add Point</Typography>
        </CardContent>
      </Card>

      {/* List of Observation Points */}
      {observationPoints.map((point) => {
        const isSelected = selectedObservation?.id === point.id; // ✅ Check if this observation is selected

        return (
          <Card
            key={point.id}
            sx={{
              minWidth: 150,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 2,
              cursor: "pointer",
              backgroundColor: isSelected ? "primary.dark" : "background.paper", // ✅ Highlight if selected
              color: isSelected ? "white" : "text.primary",
              border: isSelected ? "2px solid white" : "1px solid rgba(255, 255, 255, 0.1)", // ✅ White border if selected
              "&:hover": {
                backgroundColor: isSelected ? "primary.dark" : "action.hover",
              },
            }}
            onClick={() => selectObservationPoint(point.id)}
          >
            <CardContent>
              <Typography variant="body2">{point.title}</Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default BottomPanel;
