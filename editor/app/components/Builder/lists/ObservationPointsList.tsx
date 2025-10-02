import React from "react";
import { CardContent, Typography } from "@mui/material";
import {
  ObservationSection,
  ObservationCard,
} from "./ObservationPointsList.styles";
import { AddCircleOutline } from "@mui/icons-material";

type ObservationPoint = {
  id: number;
  title?: string;
  position?: unknown;
  target?: unknown;
};

interface ObservationPointsListProps {
  observationPoints?: ObservationPoint[];
  selectedObservation?: ObservationPoint | null;
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
  const handleObservationClick = (point: ObservationPoint, index: number) => {
    selectObservation?.(point.id);
    setPreviewIndex?.(index);

    if (point.position && point.target) {
      setPreviewMode?.(true);
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
            paddingBottom: 0,
            "&:last-child": {
              paddingBottom: "16px",
            },
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
