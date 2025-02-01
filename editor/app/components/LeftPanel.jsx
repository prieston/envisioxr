// src/components/LeftPanel.jsx
"use client";

import React from "react";
import { Box, List, ListItem, ListItemText } from "@mui/material";
import useSceneStore from "../hooks/useSceneStore";

const LeftPanel = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);
  const previewMode = useSceneStore((state) => state.previewMode);

  return (
    <Box
    sx={{
      width: "250px",
      height: "100%",
      backgroundColor: "background.paper",
      color: "text.primary",
      padding: 2,
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      userSelect: "none", // Prevent text selection

      // Disabled look & feel when condition is true (e.g., previewMode)
      pointerEvents: previewMode ? "none" : "auto", // Disables interaction when disabled
      opacity: previewMode ? 0.5 : 1,               // Reduce opacity for disabled state
      cursor: previewMode ? "not-allowed" : "default", // Change cursor to indicate non-interactivity
      filter: previewMode ? "grayscale(100%)" : "none", // Optionally add a grayscale effect
      transition: "opacity 0.3s ease, filter 0.3s ease", // Smooth transition for visual changes
    }}

    >
      <List>
        {objects.map((obj, index) => (
          <ListItem
            button
            key={index}
            onClick={() => selectObject(selectedObject?.id == obj.id ? null : obj.id)}
            sx={{
              cursor: "pointer", // ✅ Ensures items show a pointer cursor
              borderRadius: 1,
              marginBottom: 1,
              backgroundColor: selectedObject?.id === obj.id ? "primary.main" : "transparent",
              color: selectedObject?.id === obj.id ? "white" : "inherit",
              "&:hover": {
                backgroundColor: selectedObject?.id === obj.id ? "primary.dark" : "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemText primary={obj.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LeftPanel;
