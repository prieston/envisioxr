import React, { useState } from "react";
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
import { useSceneStore } from "@envisio/core";

interface SceneObjectsListProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
}

const SceneObjectsList: React.FC<SceneObjectsListProps> = () => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<
    string | null
  >(null);

  const {
    objects,
    selectedObject,
    selectObject,
    removeObject,
    deselectObject,
  } = useSceneStore();

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    objectId: string
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setSelectedItemForDelete(objectId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDeleteOption = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItemForDelete) {
      removeObject(selectedItemForDelete);
    }
    setDeleteDialogOpen(false);
    setSelectedItemForDelete(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StyledList>
        {objects.map((object) => (
          <ObjectListItem
            key={object.id}
            className="glass-card"
            selected={selectedObject?.id === object.id}
            onClick={() => {
              if (selectedObject?.id === object.id) {
                deselectObject();
              } else {
                selectObject(object.id, object.ref || null);
              }
            }}
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
        ))}
      </StyledList>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteOption}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { bgcolor: "background.paper", color: "text.primary" },
        }}
      >
        <DialogTitle>Delete Object?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SceneObjectsList;
