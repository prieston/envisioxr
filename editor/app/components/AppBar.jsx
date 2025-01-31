// src/components/AppBar.js
"use client";

import React from "react";
import { Box, Toolbar, Typography, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { showToast } from "../utils/toastUtils";

const AdminAppBar = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "60px", // Adjust height if needed
        backgroundColor: "background.paper", // Same as all panels
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingX: 2,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)", // Subtle separator
      }}
    >
      <Typography variant="h6">EnvisioXR Admin Panel</Typography>

      <Toolbar sx={{ display: "flex", gap: 1 }}>
        <IconButton color="inherit" onClick={() => showToast("Save action not yet implemented.")}>
          <SaveIcon />
        </IconButton>
        <IconButton color="inherit">
          <UndoIcon />
        </IconButton>
        <IconButton color="inherit">
          <RedoIcon />
        </IconButton>
      </Toolbar>
    </Box>
  );
};

export default AdminAppBar;
