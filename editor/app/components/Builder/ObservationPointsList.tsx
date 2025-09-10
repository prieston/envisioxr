import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AddCircleOutline } from "@mui/icons-material";

const ObservationSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  gap: theme.spacing(2),
  overflowX: "auto",
  padding: theme.spacing(1),
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
  "&::-webkit-scrollbar": {
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.3)",
    },
  },
}));

const ObservationCard = styled(Card)(({ theme }) => ({
  minWidth: 150,
  height: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  "&.selected": {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: "rgba(76, 95, 213, 0.1)",
  },
}));

interface ObservationPointsListProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
  observationPoints?: any[];
  selectedObservation?: any;
  addObservationPoint?: () => void;
  selectObservation?: (id: number) => void;
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
  const handleObservationClick = (point: any, index: number) => {
    // First select the observation point and set the preview index
    selectObservation?.(point.id);
    setPreviewIndex?.(index);

    // Only trigger camera movement if the point has both position and target set
    if (point.position && point.target) {
      // Then enable preview mode to trigger camera movement
      setPreviewMode?.(true);

      // Wait for camera movement to complete before disabling preview mode
      // Using a longer timeout to ensure the camera movement is complete
      setTimeout(() => {
        setPreviewMode?.(false);
      }, 1500);
    }
  };

  return (
    <ObservationSection previewMode={previewMode || false}>
      {observationPoints?.map((point, index) => (
        <ObservationCard
          key={point.id}
          className={
            (previewMode && index === previewIndex) ||
            (!previewMode && selectedObservation?.id === point.id)
              ? "selected"
              : ""
          }
          onClick={() => handleObservationClick(point, index)}
        >
          <CardContent>
            <Typography variant="subtitle2" noWrap>
              {point.title || "Untitled"}
            </Typography>
          </CardContent>
        </ObservationCard>
      ))}
      <ObservationCard
        onClick={addObservationPoint}
        sx={{
          border: "2px dashed rgba(255, 255, 255, 0.2)",
          backgroundColor: "transparent",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddCircleOutline />
          <Typography variant="caption">Add Point</Typography>
        </CardContent>
      </ObservationCard>
    </ObservationSection>
  );
};

export default ObservationPointsList;
