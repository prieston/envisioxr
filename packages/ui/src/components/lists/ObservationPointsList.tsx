import React from "react";
import { ListItemText, Typography } from "@mui/material";
import {
  ObservationSection,
  ObservationListItem,
  AddButton,
} from "./ObservationPointsList.styles";
import { Add } from "@mui/icons-material";

export type ObservationPoint = {
  id: string | number;
  title?: string;
  position?: unknown;
  target?: unknown;
};

export interface ObservationPointsListProps {
  observationPoints?: ObservationPoint[];
  selectedObservation?: ObservationPoint | { id: string | number };
  addObservationPoint?: () => void;
  selectObservation?: (id: string | number) => void;
  previewMode?: boolean;
  previewIndex?: number;
  setPreviewIndex?: (index: number) => void;
  setPreviewMode?: (mode: boolean) => void;
}

const ObservationPointsList: React.FC<ObservationPointsListProps> = ({
  observationPoints,
  selectedObservation,
  addObservationPoint,
  selectObservation,
  previewMode,
  previewIndex,
  setPreviewIndex,
  setPreviewMode,
}) => {
  console.log("[ObservationPointsList] Props received:", {
    observationPoints,
    selectedObservation,
    count: observationPoints?.length,
  });

  const handleClick = (point: ObservationPoint, index: number) => {
    selectObservation?.(point.id);
    setPreviewIndex?.(index);
    if (point.position && point.target) {
      setPreviewMode?.(true);
      setTimeout(() => setPreviewMode?.(false), 1500);
    }
  };

  return (
    <ObservationSection previewMode={previewMode || false}>
      {/* Add button */}
      <AddButton onClick={addObservationPoint} title="Add Observation Point">
        <Add sx={{ fontSize: "1.2rem" }} />
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            marginLeft: 0.5,
          }}
        >
          Add Point
        </Typography>
      </AddButton>

      {/* List items */}
      {observationPoints?.map((point, index) => (
        <ObservationListItem
          key={point.id}
          selected={
            (previewMode && index === previewIndex) ||
            (!previewMode && selectedObservation?.id === point.id)
          }
          onClick={() => handleClick(point, index)}
        >
          <ListItemText
            primary={point.title || `Point ${index + 1}`}
            primaryTypographyProps={{
              noWrap: true,
              sx: { color: "inherit" }, // Inherit color from parent
            }}
          />
        </ObservationListItem>
      ))}
    </ObservationSection>
  );
};

export default ObservationPointsList;
