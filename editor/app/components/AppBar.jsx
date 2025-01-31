// src/components/AppBar.js
"use client";

import React, { useState } from "react";
import { Box, Toolbar, Typography, IconButton, Button, Tooltip, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import MoveIcon from "@mui/icons-material/OpenWith";
import RotateIcon from "@mui/icons-material/RotateRight";
import ScaleIcon from "@mui/icons-material/ZoomOutMap";
import Image from "next/image";
import { showToast } from "../utils/toastUtils";
import AddModelDialog from "./AddModelDialog";
import useSceneStore from "../hooks/useSceneStore";

const AdminAppBar = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const selectedObject = useSceneStore((state) => state.selectedObject);

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "background.paper",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingX: 2,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Left Section: Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Image src="/images/logo/logo-dark.svg" alt="EnvisioXR Logo" width={120} height={40} />
        <Typography variant="h6">Admin Panel</Typography>
      </Box>

      {/* Center Section: Add Model Button */}
      <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
        Add Model
      </Button>

      {/* Right Section: Transform Controls & Actions */}
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Transform Controls (Only available when a model is selected) */}
        <Tooltip title="Move">
          <span>
            <IconButton
              color={transformMode === "translate" ? "primary" : "inherit"}
              onClick={() => setTransformMode("translate")}
              disabled={!selectedObject}
            >
              <MoveIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Rotate">
          <span>
            <IconButton
              color={transformMode === "rotate" ? "primary" : "inherit"}
              onClick={() => setTransformMode("rotate")}
              disabled={!selectedObject}
            >
              <RotateIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Scale">
          <span>
            <IconButton
              color={transformMode === "scale" ? "primary" : "inherit"}
              onClick={() => setTransformMode("scale")}
              disabled={!selectedObject}
            >
              <ScaleIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Divider between Transform Controls & Other Actions */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255, 255, 255, 0.3)" }} />

        {/* Other Actions */}
        <Tooltip title="Save">
          <IconButton color="inherit" onClick={() => showToast("Save action not yet implemented.")}>
            <SaveIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Undo">
          <IconButton color="inherit">
            <UndoIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Redo">
          <IconButton color="inherit">
            <RedoIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* Add Model Dialog */}
      <AddModelDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};

export default AdminAppBar;
