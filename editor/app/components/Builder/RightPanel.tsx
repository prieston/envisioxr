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
  width: "280px",
  height: "100%",
  backgroundColor: "#121212",
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "1px",
    background:
      "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "& input": {
      color: theme.palette.text.primary,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.text.primary,
    },
  },
  marginBottom: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: theme.palette.text.primary,
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  "&.delete": {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "rgba(239, 68, 68, 0.9)",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
  },
}));

const PanelTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
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
        <PanelTitle>Select an observation point to edit</PanelTitle>
      </RightPanelContainer>
    );
  }

  return (
    <RightPanelContainer previewMode={previewMode}>
      <PanelTitle>Edit Observation</PanelTitle>

      <StyledTextField
        label="Title"
        fullWidth
        value={localTitle}
        onChange={handleTitleChange}
      />

      <StyledTextField
        label="Description"
        multiline
        rows={4}
        fullWidth
        value={localDescription}
        onChange={handleDescriptionChange}
      />

      <ActionButton fullWidth onClick={handleCapturePOV}>
        Capture Camera POV
      </ActionButton>

      <ActionButton
        fullWidth
        className="delete"
        onClick={() => deleteObservationPoint(selectedObservation.id)}
      >
        Delete Observation
      </ActionButton>
    </RightPanelContainer>
  );
};

export default RightPanel;
