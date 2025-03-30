"use client";

import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MoreVert } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";
import Typography from "@mui/material/Typography";

// Container for the left panel with conditional styling based on previewMode
interface LeftPanelContainerProps {
  previewMode: boolean;
}

const LeftPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<LeftPanelContainerProps>(({ theme, previewMode }) => ({
  width: "280px",
  height: "100%",
  backgroundColor: "#121212",
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderRight: "1px solid rgba(255, 255, 255, 0.08)",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "1px",
    background:
      "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent)",
  },
}));

// Styled ListItem for objects, using a prop (selectedItem) to determine styles
interface ObjectListItemProps {
  selectedItem: boolean;
}

const ObjectListItem = styled(ListItem)<ObjectListItemProps>(
  ({ theme, selectedItem }) => ({
    cursor: "pointer",
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    backgroundColor: selectedItem
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(255, 255, 255, 0.05)",
    color: selectedItem ? theme.palette.text.primary : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    transition: "all 0.2s ease",
    border: selectedItem
      ? "1px solid rgba(255, 255, 255, 0.2)"
      : "1px solid rgba(255, 255, 255, 0.05)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      transform: "translateX(4px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  })
);

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  "& .MuiListItemText-secondary": {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: theme.palette.text.primary,
  },
}));

const PanelTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const LeftPanel = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);
  const removeObject = useSceneStore((state) => state.removeObject); // assumed deletion function
  const previewMode = useSceneStore((state) => state.previewMode);

  // Local state for menu and deletion confirmation.
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Open menu on three-dots click and store target id
  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    objectId: string
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setDeleteTargetId(objectId);
  };

  // Close the menu.
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // When "Delete" is selected in the menu, close menu and open confirmation dialog.
  const handleDeleteOption = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // Confirm deletion: log and remove object.
  const confirmDelete = () => {
    if (deleteTargetId) {
      removeObject(deleteTargetId);
    } else {
      console.log("No object id to delete.");
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // Cancel deletion.
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    // Optionally clear deleteTargetId if you don't want to keep it.
    setDeleteTargetId(null);
  };

  return (
    <>
      <LeftPanelContainer previewMode={previewMode}>
        <PanelTitle>Scene Objects</PanelTitle>
        <StyledList>
          {objects.map((obj) => (
            <ObjectListItem
              key={obj.id}
              selectedItem={selectedObject?.id === obj.id}
              onClick={() =>
                selectObject(
                  selectedObject?.id === obj.id ? null : obj.id,
                  obj.ref
                )
              }
            >
              <StyledListItemText
                primary={obj.name}
                secondary={obj.type || "Model"}
              />
              {!previewMode && (
                <StyledIconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, obj.id)}
                >
                  <MoreVert />
                </StyledIconButton>
              )}
            </ObjectListItem>
          ))}
        </StyledList>
      </LeftPanelContainer>

      {/* Menu for options */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteOption}>Delete</MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Are you sure you want to delete this object?</DialogTitle>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeftPanel;
