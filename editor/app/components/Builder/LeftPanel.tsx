"use client";

import React, { useState } from "react";
import { styled } from "@mui/material/styles";
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
  Tabs,
  Tab,
} from "@mui/material";
import { MoreVert, ViewInAr, Landscape } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";
import EnvironmentPanel from "../../components/Environment/EnvironmentPanel";

// Container for the left panel with conditional styling based on previewMode
interface LeftPanelContainerProps {
  previewMode: boolean;
}

const LeftPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<LeftPanelContainerProps>(({ theme, previewMode }) => ({
  width: "280px",
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderRight: `1px solid ${theme.palette.divider}`,
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
      ? "rgba(25, 118, 210, 0.12)"
      : "rgba(255, 255, 255, 0.05)",
    color: selectedItem ? theme.palette.primary.main : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    transition:
      "opacity 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
    border: selectedItem
      ? `1px solid ${theme.palette.primary.main}`
      : "1px solid rgba(255, 255, 255, 0.05)",
    "&:hover": {
      backgroundColor: selectedItem
        ? "rgba(25, 118, 210, 0.16)"
        : "rgba(255, 255, 255, 0.08)",
      opacity: 0.9,
      border: selectedItem
        ? `1px solid ${theme.palette.primary.main}`
        : "1px solid rgba(255, 255, 255, 0.2)",
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

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "calc(100% - 48px)", // 48px is the height of the tabs
  overflow: "auto",
}));

const LeftPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState(null);
  const {
    objects,
    selectedObject,
    selectObject,
    removeObject,
    previewMode,
    deselectObject,
  } = useSceneStore();

  // Open menu on three-dots click and store target id
  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    objectId: string
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setSelectedItemForDelete(objectId);
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
    if (selectedItemForDelete) {
      removeObject(selectedItemForDelete);
    } else {
      console.log("No object id to delete.");
    }
    setDeleteDialogOpen(false);
    setSelectedItemForDelete(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <LeftPanelContainer previewMode={previewMode}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          "& .MuiTab-root": {
            color: "text.secondary",
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
      >
        <Tab
          icon={<ViewInAr />}
          label="Assets"
          sx={{ textTransform: "none" }}
        />
        <Tab
          icon={<Landscape />}
          label="Environment"
          sx={{ textTransform: "none" }}
        />
      </Tabs>

      {/* Assets Tab */}
      {activeTab === 0 && (
        <TabPanel>
          <StyledList>
            {objects.map((object) => (
              <ObjectListItem
                key={object.id}
                selectedItem={selectedObject?.id === object.id}
                onClick={() => {
                  // If clicking the same object that's already selected, deselect it
                  if (selectedObject?.id === object.id) {
                    deselectObject();
                  } else {
                    // Only pass the ref if we're selecting a new object
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
        </TabPanel>
      )}

      {/* Environment Tab */}
      {activeTab === 1 && (
        <TabPanel>
          <EnvironmentPanel />
        </TabPanel>
      )}

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
    </LeftPanelContainer>
  );
};

export default LeftPanel;
