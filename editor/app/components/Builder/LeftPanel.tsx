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

// Container for the left panel with conditional styling based on previewMode
interface LeftPanelContainerProps {
  previewMode: boolean;
}

const LeftPanelContainer = styled(Box)<LeftPanelContainerProps>(
  ({ theme, previewMode }) => ({
    width: "250px",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    userSelect: "none",
    pointerEvents: previewMode ? "none" : "auto",
    opacity: previewMode ? 0.5 : 1,
    cursor: previewMode ? "not-allowed" : "default",
    filter: previewMode ? "grayscale(100%)" : "none",
    transition: "opacity 0.3s ease, filter 0.3s ease",
  })
);

// Styled ListItem for objects, using a prop (selectedItem) to determine styles
interface ObjectListItemProps {
  selectedItem: boolean;
}

const ObjectListItem = styled(ListItem)<ObjectListItemProps>(
  ({ theme, selectedItem }) => ({
    cursor: "pointer",
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    backgroundColor: selectedItem ? theme.palette.primary.main : "transparent",
    color: selectedItem ? "white" : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "&:hover": {
      backgroundColor: selectedItem
        ? theme.palette.primary.dark
        : "rgba(255, 255, 255, 0.1)",
    },
  })
);

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
  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, objectId: string) => {
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
      console.log("Deleting object with id:", deleteTargetId);
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

  console.info(objects)
  return (
    <>
      <LeftPanelContainer previewMode={previewMode}>
        <List>
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
              <ListItemText primary={obj.name} />
              {!previewMode && (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, obj.id)}
                >
                  <MoreVert />
                </IconButton>
              )}
            </ObjectListItem>
          ))}
        </List>
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
        <DialogTitle>
          Are you sure you want to delete this object?
        </DialogTitle>
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
