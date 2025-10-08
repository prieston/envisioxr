"use client";

import React, { useState } from "react";
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
  ObservationSection,
  ObservationListItem,
  AddButton,
} from "./ObservationPointsList.styles";
import { Add, MoreVert } from "@mui/icons-material";

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
  deleteObservationPoint,
  previewMode,
  setPreviewIndex,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<
    string | number | null
  >(null);

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
          selected={selectedObservation?.id === point.id}
          onClick={() => handleClick(point, index)}
        >
          <ListItemText
            primary={point.title || `Point ${index + 1}`}
            primaryTypographyProps={{
              noWrap: true,
              sx: { color: "inherit" }, // Inherit color from parent
            }}
          />
          <IconButton
            onClick={(e) => handleMenuOpen(e, point.id)}
            size="small"
            sx={{
              color: "rgba(100, 116, 139, 0.85)",
              borderRadius: "8px",
              transition: "color 0.15s ease, background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                color: "#2563eb",
              },
            }}
          >
            <MoreVert />
          </IconButton>
        </ObservationListItem>
      ))}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow:
              "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
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
              "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
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
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.85)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              padding: "0 16px",
              transition: "border-color 0.15s ease, color 0.15s ease",
              "&:hover": {
                borderColor: "rgba(37, 99, 235, 0.2)",
                color: "#2563eb",
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
              borderRadius: "8px",
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
