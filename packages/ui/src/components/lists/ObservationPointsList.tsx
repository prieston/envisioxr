"use client";

import React, { useState, useMemo } from "react";
import {
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ObservationSection,
  ObservationListItem,
  AddButton,
} from "./ObservationPointsList.styles";
import { Add, MoreVert, DragIndicator } from "@mui/icons-material";

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
  selectObservation?: (id: string | number | null) => void;
  deleteObservationPoint?: (id: string | number) => void;
  reorderObservationPoints?: (startIndex: number, endIndex: number) => void;
  previewMode?: boolean;
  previewIndex?: number;
  setPreviewIndex?: (index: number) => void;
  setPreviewMode?: (mode: boolean) => void;
}


interface SortableItemProps {
  point: ObservationPoint;
  index: number;
  selected: boolean;
  onClick: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  point,
  index,
  selected,
  onClick,
  onMenuOpen,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if we're dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
    onClick();
  };

  return (
    <ObservationListItem
      ref={setNodeRef}
      style={style}
      selected={selected}
      onClick={handleClick}
      sx={{
        cursor: disabled ? "default" : isDragging ? "grabbing" : "pointer",
        boxShadow: isDragging
          ? "0 8px 32px rgba(95, 136, 199, 0.24), 0 2px 8px rgba(0, 0, 0, 0.16)"
          : undefined,
      }}
    >
      {!disabled && (
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          sx={{
            color: "rgba(100, 116, 139, 0.6)",
            cursor: "grab",
            padding: "4px",
            marginRight: "4px",
            "&:active": {
              cursor: "grabbing",
            },
            "&:hover": {
              color: "var(--color-primary, #6B9CD8)",
              backgroundColor: "rgba(95, 136, 199, 0.08)",
            },
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIndicator sx={{ fontSize: "1rem" }} />
        </IconButton>
      )}
      <ListItemText
        primary={point.title || `Point ${index + 1}`}
        primaryTypographyProps={{
          noWrap: true,
          sx: { color: "inherit" },
        }}
      />
      <IconButton
        onClick={onMenuOpen}
        size="small"
        sx={{
          color: "rgba(100, 116, 139, 0.85)",
          borderRadius: 4,
          transition: "color 0.15s ease, background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "rgba(95, 136, 199, 0.08)",
            color: "var(--color-primary, #6B9CD8)",
          },
        }}
      >
        <MoreVert />
      </IconButton>
    </ObservationListItem>
  );
};

const ObservationPointsList: React.FC<ObservationPointsListProps> = ({
  observationPoints,
  selectedObservation,
  addObservationPoint,
  selectObservation,
  deleteObservationPoint,
  reorderObservationPoints,
  previewMode,
  setPreviewIndex,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<
    string | number | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleClick = (point: ObservationPoint, index: number) => {
    // Toggle selection: deselect if clicking the same observation
    if (selectedObservation?.id === point.id) {
      selectObservation?.(null); // Deselect
      setPreviewIndex?.(0);
    } else {
      selectObservation?.(point.id);
      setPreviewIndex?.(index);
    }
  };

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    pointId: string | number
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setSelectedItemForDelete(pointId);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleDeleteOption = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItemForDelete !== null)
      deleteObservationPoint?.(selectedItemForDelete);
    setDeleteDialogOpen(false);
    setSelectedItemForDelete(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !reorderObservationPoints || !observationPoints) return;

    const oldIndex = observationPoints.findIndex((p) => p.id === active.id);
    const newIndex = observationPoints.findIndex((p) => p.id === over.id);

    if (oldIndex !== newIndex) {
      reorderObservationPoints(oldIndex, newIndex);
    }
  };

  // Get IDs for sortable context
  const itemIds = useMemo(
    () => observationPoints?.map((p) => p.id) || [],
    [observationPoints]
  );

  const isDragDisabled = previewMode || false;

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

      {/* List items with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={horizontalListSortingStrategy}
        >
          {observationPoints?.map((point, index) => (
            <SortableItem
              key={point.id}
              point={point}
              index={index}
              selected={selectedObservation?.id === point.id}
              onClick={() => handleClick(point, index)}
              onMenuOpen={(e) => handleMenuOpen(e, point.id)}
              disabled={isDragDisabled}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "0 8px 32px rgba(95, 136, 199, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <MenuItem
          onClick={handleDeleteOption}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "rgba(51, 65, 85, 0.95)",
            padding: "8px 16px",
            transition: "background-color 0.15s ease, color 0.15s ease",
            "&:hover": {
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              color: "#ef4444",
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px",
            boxShadow:
              "0 8px 32px rgba(95, 136, 199, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
          }}
        >
          Delete Observation Point?
        </DialogTitle>
        <DialogActions sx={{ padding: "16px" }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              minHeight: "38px",
              borderRadius: 4,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "0 16px",
              transition: "border-color 0.15s ease, color 0.15s ease",
              "&:hover": {
                borderColor: "rgba(95, 136, 199, 0.2)",
                color: "var(--color-primary, #6B9CD8)",
                backgroundColor: "transparent",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{
              minHeight: "38px",
              borderRadius: 4,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              padding: "0 16px",
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ObservationSection>
  );
};

export default ObservationPointsList;
