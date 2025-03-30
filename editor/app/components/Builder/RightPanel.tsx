"use client";

import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import useSceneStore from "../../hooks/useSceneStore";

// Styled container for the RightPanel with conditional styles based on previewMode
interface RightPanelContainerProps {
  previewMode: boolean;
}

const RightPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<RightPanelContainerProps>(({ theme, previewMode }) => ({
  width: "300px",
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
}));

// Styled Button for actions with consistent margin-top spacing
const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

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

  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");

  useEffect(() => {
    if (selectedObservation) {
      setLocalTitle(selectedObservation.title || "");
      setLocalDescription(selectedObservation.description || "");
    }
  }, [selectedObservation]);

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

  const handleCapturePOV = () => {
    useSceneStore.getState().setCapturingPOV(true);
  };

  if (!selectedObservation) {
    return (
      <RightPanelContainer previewMode={previewMode}>
        <Typography>Select an observation point to edit</Typography>
      </RightPanelContainer>
    );
  }

  return (
    <RightPanelContainer previewMode={previewMode}>
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

      <ActionButton
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleCapturePOV}
      >
        Capture Camera POV
      </ActionButton>

      <ActionButton
        variant="contained"
        color="error"
        fullWidth
        onClick={() => deleteObservationPoint(selectedObservation.id)}
      >
        Delete
      </ActionButton>
    </RightPanelContainer>
  );
};

export default RightPanel;
