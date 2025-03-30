"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import useSceneStore from "@/app/hooks/useSceneStore";

// Container for the entire bottom panel
interface BottomPanelContainerProps {
  previewMode: boolean;
}

const BottomPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<BottomPanelContainerProps>(({ theme, previewMode }) => ({
  width: "100%",
  height: "120px",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  overflowX: "auto",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "auto",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
  userSelect: "none",
}));

// Card for the "Add New Observation" button
const AddObservationCard = styled(Card)(({ theme }) => ({
  minWidth: 150,
  height: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  background: "#1e1e1e",
  backdropFilter: "blur(10px)",
  border: "2px dashed rgba(255, 255, 255, 0.1)",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease-in-out",
  marginRight: theme.spacing(2),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "2px dashed rgba(255, 255, 255, 0.2)",
    backgroundColor: "#1e1e1e",
  },
}));

// CardContent for centering content inside cards
const CenteredCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  height: "100%",
  justifyContent: "center",
  "&:last-child": {
    paddingBottom: theme.spacing(1.5),
  },
}));

// Card for individual observation points
interface ObservationCardProps {
  selected: boolean;
}

const StyledObservationCard = styled(Card)<ObservationCardProps>(
  ({ theme, selected }) => ({
    minWidth: 150,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(2),
    cursor: "pointer",
    background: "#1e1e1e",
    backdropFilter: "blur(10px)",
    border: selected
      ? "2px solid rgba(255, 255, 255, 0.3)"
      : "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: selected
      ? "0 4px 12px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: selected
        ? "2px solid rgba(255, 255, 255, 0.4)"
        : "1px solid rgba(255, 255, 255, 0.2)",
      backgroundColor: "#1e1e1e",
    },
  })
);

const ObservationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.875rem",
  textAlign: "center",
  color: theme.palette.text.primary,
}));

const ObservationDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
}));

const AddIconWrapper = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  minWidth: 32,
  minHeight: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: theme.palette.text.primary,
  transition: "all 0.3s ease-in-out",
  flexShrink: 0,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "scale(1.1)",
  },
}));

const BottomPanel = () => {
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const selectObservationPoint = useSceneStore(
    (state) => state.selectObservationPoint
  );
  const addObservationPoint = useSceneStore(
    (state) => state.addObservationPoint
  );
  const previewMode = useSceneStore((state) => state.previewMode);

  return (
    <BottomPanelContainer previewMode={previewMode}>
      <AddObservationCard onClick={addObservationPoint}>
        <CenteredCardContent>
          <AddIconWrapper>
            <AddIcon sx={{ fontSize: 24 }} />
          </AddIconWrapper>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Add Observation
          </Typography>
        </CenteredCardContent>
      </AddObservationCard>

      {observationPoints.map((observation) => (
        <StyledObservationCard
          key={observation.id}
          selected={selectedObservation?.id === observation.id}
          onClick={() => selectObservationPoint(observation.id)}
        >
          <CenteredCardContent>
            <ObservationTitle>
              {observation.title || "Untitled"}
            </ObservationTitle>
            <ObservationDescription>
              {observation.description || "No description"}
            </ObservationDescription>
          </CenteredCardContent>
        </StyledObservationCard>
      ))}
    </BottomPanelContainer>
  );
};

export default BottomPanel;
