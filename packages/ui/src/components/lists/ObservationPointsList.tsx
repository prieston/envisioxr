import React from "react";
import { CardContent, Typography } from "@mui/material";
import {
  ObservationSection,
  ObservationCard,
} from "./ObservationPointsList.styles";
import { AddCircleOutline } from "@mui/icons-material";

export type ObservationPoint = {
  id: string | number;
  title?: string;
  position?: unknown;
  target?: unknown;
};

export interface ObservationPointsListProps {
  items?: ObservationPoint[];
  selectedId?: string | number | null;
  onAdd?: () => void;
  onSelect?: (id: string | number) => void;
  previewMode?: boolean;
  previewIndex?: number;
  setPreviewIndex?: (index: number) => void;
  setPreviewMode?: (mode: boolean) => void;
}

const ObservationPointsList: React.FC<ObservationPointsListProps> = ({
  items,
  selectedId,
  onAdd,
  onSelect,
  previewMode,
  previewIndex,
  setPreviewIndex,
  setPreviewMode,
}) => {
  const handleClick = (point: ObservationPoint, index: number) => {
    onSelect?.(point.id);
    setPreviewIndex?.(index);
    if (point.position && point.target) {
      setPreviewMode?.(true);
      setTimeout(() => setPreviewMode?.(false), 1500);
    }
  };

  return (
    <ObservationSection previewMode={previewMode || false}>
      <ObservationCard
        onClick={onAdd}
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
            "&:last-child": { paddingBottom: "16px" },
          }}
        >
          <AddCircleOutline />
          <Typography variant="caption">Add Point</Typography>
        </CardContent>
      </ObservationCard>
      {items?.map((point, index) => (
        <ObservationCard
          key={point.id}
          className={
            (previewMode && index === previewIndex) ||
            (!previewMode && selectedId === point.id)
              ? "selected"
              : ""
          }
          onClick={() => handleClick(point, index)}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              padding: "8px 16px",
              "&:last-child": { paddingBottom: "8px" },
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
