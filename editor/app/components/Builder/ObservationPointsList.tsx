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
  borderRadius: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  padding: 0,
  backgroundColor: "transparent",
  color: "inherit",
  border: "none",
  boxShadow: "none",
  transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:not(:last-child)::after": {
    content: '""',
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "1px",
    height: "60%",
    background:
      "linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.2), transparent)",
  },
  "&:hover": {
    color: "#2563eb",
  },
  "&.selected": {
    color: "#2563eb",
    "&:hover": {
      color: "#2563eb",
    },
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
      <ObservationCard
        onClick={addObservationPoint}
        sx={{
          border: "2px dashed rgba(37, 99, 235, 0.3)",
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
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
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              padding: "8px 16px",
              "&:last-child": {
                paddingBottom: "8px",
              },
            }}
          >
            <Typography variant="subtitle2" noWrap>
              {point.title || "Untitled"}
            </Typography>
          </CardContent>
        </ObservationCard>
      ))}
    </ObservationSection>
  );
};

export default ObservationPointsList;
