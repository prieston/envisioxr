"use client";
import React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  SaveIcon,
  UndoIcon,
  RedoIcon,
  AddIcon,
  DeleteIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  SettingsIcon,
} from "@klorad/ui";

interface AppBarProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onOpenSettings: () => void;
  isVisible: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canDelete: boolean;
  onAddModel: () => void;
}

const AppBar: React.FC<AppBarProps> = ({
  onSave,
  onUndo,
  onRedo,
  onDelete,
  onToggleVisibility,
  onOpenSettings,
  isVisible,
  isSaving,
  canUndo,
  canRedo,
  canDelete,
  onAddModel,
}) => {
  const handleAddModel = () => {
    onAddModel();
  };

  return (
    <MuiAppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          EnvisioXR
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
          <Tooltip title="Add Model">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddModel}
            >
              Add Model
            </Button>
          </Tooltip>

          <Tooltip title="Undo">
            <span>
              <IconButton
                onClick={onUndo}
                disabled={!canUndo}
                color="inherit"
                size="small"
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Redo">
            <span>
              <IconButton
                onClick={onRedo}
                disabled={!canRedo}
                color="inherit"
                size="small"
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Delete Selected">
            <span>
              <IconButton
                onClick={onDelete}
                disabled={!canDelete}
                color="inherit"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isVisible ? "Hide Models" : "Show Models"}>
            <IconButton
              onClick={onToggleVisibility}
              color="inherit"
              size="small"
            >
              {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Settings">
            <IconButton onClick={onOpenSettings} color="inherit" size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
