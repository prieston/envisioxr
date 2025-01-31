// app/components/RightPanel.jsx
"use client";

import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import useSceneStore from "../hooks/useSceneStore";
import { showToast } from "../utils/toastUtils";

const RightPanel = () => {
  const selectedObject = useSceneStore((state) => state.selectedObject);

  return (
    <Box
      sx={{
        width: 300,
        backgroundColor: "background.paper",
        padding: 2,
        borderLeft: "1px solid rgba(255,255,255,0.1)", // Subtle border
      }}
    >
      {selectedObject ? (
        <>
          <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
            Edit Object
          </Typography>
          <TextField label="Object Name" fullWidth margin="normal" value={selectedObject.name} disabled />
          <TextField label="Description" multiline rows={4} fullWidth margin="normal" />

          <Button variant="contained" color="primary" onClick={() => showToast("Save action not yet implemented.")}>
            Save
          </Button>
        </>
      ) : (
        <Typography sx={{ color: "text.secondary" }}>Select an object to edit</Typography>
      )}
    </Box>
  );
};

export default RightPanel;
