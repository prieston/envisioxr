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
} from "@mui/material";
import {
  StyledList,
  ObjectListItem,
  StyledListItemText,
  StyledIconButton,
} from "./SceneObjectsList.styles";
import { MoreVert } from "@mui/icons-material";

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
}

const SceneObjectsList: React.FC<SceneObjectsListProps> = ({
  items = [],
  selectedId,
  onSelect,
  onDelete,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<
    string | null
  >(null);

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

  // Memoize items list to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    return items.map((object) => (
      <ObjectListItem
        key={object.id}
        className="glass-card"
        selected={selectedId === object.id}
        onClick={() => onSelect?.(object.id)}
      >
        <StyledListItemText
          className="glass-card-content"
          primary={object.name || "Untitled Object"}
          secondary={`Type: ${object.type}`}
        />
        <StyledIconButton
          onClick={(e) => handleMenuOpen(e, object.id)}
          size="small"
        >
          <MoreVert />
        </StyledIconButton>
      </ObjectListItem>
    ));
  }, [items, selectedId, onSelect, handleMenuOpen]);

  return (
    <Box sx={{ width: "100%" }}>
      <StyledList>
        {memoizedItems}
      </StyledList>

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
