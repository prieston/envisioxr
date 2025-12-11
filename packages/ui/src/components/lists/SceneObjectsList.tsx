"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  StyledList,
  ObjectListItem,
  StyledListItemText,
  StyledIconButton,
} from "./SceneObjectsList.styles";
import { MoreVert, DragIndicator } from "@mui/icons-material";

export interface SceneObjectItem {
  id: string;
  name?: string;
  type?: string;
}

export interface SceneObjectsListProps {
  items?: SceneObjectItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  disabled?: boolean;
}

interface SortableObjectItemProps {
  object: SceneObjectItem;
  selected: boolean;
  onClick: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const SortableObjectItem: React.FC<SortableObjectItemProps> = ({
  object,
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
  } = useSortable({ id: object.id, disabled });

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
    <ObjectListItem
      ref={setNodeRef}
      style={style}
      className="glass-card"
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
            marginRight: "8px",
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
      <StyledListItemText
        className="glass-card-content"
        primary={object.name || "Untitled Object"}
        secondary={`Type: ${object.type}`}
      />
      <StyledIconButton
        onClick={onMenuOpen}
        size="small"
      >
        <MoreVert />
      </StyledIconButton>
    </ObjectListItem>
  );
};

const SceneObjectsList: React.FC<SceneObjectsListProps> = ({
  items = [],
  selectedId,
  onSelect,
  onDelete,
  onReorder,
  disabled = false,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<
    string | null
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

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    objectId: string
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setSelectedItemForDelete(objectId);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleDeleteOption = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItemForDelete) onDelete?.(selectedItemForDelete);
    setDeleteDialogOpen(false);
    setSelectedItemForDelete(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onReorder || !items) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== newIndex) {
      onReorder(oldIndex, newIndex);
    }
  };

  // Get IDs for sortable context
  const itemIds = useMemo(
    () => items.map((item) => item.id),
    [items]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <StyledList>
            {items.map((object) => (
              <SortableObjectItem
                key={object.id}
                object={object}
                selected={selectedId === object.id}
                onClick={() => onSelect?.(object.id)}
                onMenuOpen={(e) => handleMenuOpen(e, object.id)}
                disabled={disabled}
              />
            ))}
          </StyledList>
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
          Delete Object?
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
    </Box>
  );
};

export default SceneObjectsList;
