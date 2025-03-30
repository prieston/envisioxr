"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import useSceneStore from "../../hooks/useSceneStore";

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
  border: "1px dashed rgba(255, 255, 255, 0.5)",
  marginRight: theme.spacing(2),
  "&:hover": {
    border: "1px solid white",
  },
}));

// CardContent for centering content inside cards
const CenteredCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

// Card for individual observation points
interface ObservationCardProps {
  selected: boolean;
}

const ObservationCard = styled(Card)<ObservationCardProps>(
  ({ theme, selected }) => ({
    minWidth: 150,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(2),
    cursor: "pointer",
    backgroundColor: selected
      ? theme.palette.primary.dark
      : theme.palette.background.paper,
    color: selected ? "white" : theme.palette.text.primary,
    border: selected ? "2px solid white" : "1px solid rgba(255, 255, 255, 0.1)",
    "&:hover": {
      backgroundColor: selected
        ? theme.palette.primary.dark
        : theme.palette.action.hover,
    },
  })
);

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
      {/* Add New Observation Button */}
      <AddObservationCard onClick={addObservationPoint}>
        <CenteredCardContent>
          <Tooltip title="Add Observation Point">
            <IconButton color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="caption">Add Point</Typography>
        </CenteredCardContent>
      </AddObservationCard>

      {/* List of Observation Points */}
      {observationPoints.map((point) => {
        const isSelected = selectedObservation?.id === point.id;
        return (
          <ObservationCard
            key={point.id}
            selected={isSelected}
            onClick={() => selectObservationPoint(point.id)}
          >
            <CardContent>
              <Typography variant="body2">{point.title}</Typography>
            </CardContent>
          </ObservationCard>
        );
      })}
    </BottomPanelContainer>
  );
};

export default BottomPanel;
