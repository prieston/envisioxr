import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MoreVert } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";

const StyledList = styled(List)(({ theme }) => ({
  padding: 0, // Remove padding from list
}));

const ObjectListItem = styled(ListItem)<{ selected: boolean }>(
  ({ theme, selected }) => ({
    cursor: "pointer",
    borderRadius: 0, // Remove border radius
    marginBottom: theme.spacing(0.5), // Reduce margin for tighter spacing
    marginLeft: `-${theme.spacing(2)}`, // Negative margin to extend to container edges
    marginRight: `-${theme.spacing(2)}`, // Negative margin to extend to container edges
    paddingLeft: theme.spacing(2), // Restore padding for content
    paddingRight: theme.spacing(2), // Restore padding for content
    paddingTop: theme.spacing(1.5), // Vertical padding
    paddingBottom: theme.spacing(1.5), // Vertical padding
    backgroundColor: selected ? "rgba(37, 99, 235, 0.12)" : "transparent",
    color: selected ? "#2563eb" : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1, // Make item flex to fill available space
    border: "none", // Remove border
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smoother animation
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "transparent",
      transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: -1,
    },
    "&:hover": {
      "&::before": {
        backgroundColor: selected
          ? "rgba(37, 99, 235, 0.16)"
          : "rgba(37, 99, 235, 0.08)",
      },
      color: selected ? "#2563eb" : "#2563eb",
      transform: "translateX(4px)", // Subtle slide animation
    },
    "&:active": {
      transform: "translateX(2px)", // Pressed state
    },
  })
);

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

      {/* Menu for object actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteOption}>Delete</MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
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
