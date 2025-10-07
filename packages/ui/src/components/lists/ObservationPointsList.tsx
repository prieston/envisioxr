import React from "react";
import { ListItemText, Typography, Box } from "@mui/material";
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
      {/* Add button */}
      <AddButton onClick={onAdd} title="Add Observation Point">
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
      {items?.map((point, index) => (
        <ObservationListItem
          key={point.id}
          selected={
            (previewMode && index === previewIndex) ||
            (!previewMode && selectedId === point.id)
          }
          onClick={() => handleClick(point, index)}
        >
          <ListItemText
            primary={point.title || `Point ${index + 1}`}
            primaryTypographyProps={{
              noWrap: true,
            }}
          />
        </ObservationListItem>
      ))}
    </ObservationSection>
  );
};

export default ObservationPointsList;
