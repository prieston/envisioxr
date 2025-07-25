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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MoreVert } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const ObjectListItem = styled(ListItem)<{ selected: boolean }>(
  ({ theme, selected }) => ({
    cursor: "pointer",
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    backgroundColor: selected
      ? "rgba(25, 118, 210, 0.12)"
      : "rgba(255, 255, 255, 0.05)",
    color: selected ? theme.palette.primary.main : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    transition: "all 0.2s ease",
    border: selected
      ? `1px solid ${theme.palette.primary.main}`
      : "1px solid rgba(255, 255, 255, 0.05)",
    "&:hover": {
      backgroundColor: selected
        ? "rgba(25, 118, 210, 0.16)"
        : "rgba(255, 255, 255, 0.08)",
      transform: "translateX(4px)",
      border: selected
        ? `1px solid ${theme.palette.primary.main}`
        : "1px solid rgba(255, 255, 255, 0.2)",
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

const PanelTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
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
    <Box>
      <StyledList>
        {objects.map((object) => (
          <ObjectListItem
            key={object.id}
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
