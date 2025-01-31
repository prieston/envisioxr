// src/components/AppBar.js
"use client";

import React, { useState } from "react";
import { Box, Toolbar, Typography, IconButton, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import Image from "next/image";
import { showToast } from "../utils/toastUtils";
import AddModelDialog from "./AddModelDialog";

const AdminAppBar = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: "60px",
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

      {/* Right Section: Actions */}
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

      {/* Add Model Dialog */}
      <AddModelDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};

export default AdminAppBar;
