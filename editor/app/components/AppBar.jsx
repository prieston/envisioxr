// src/components/AppBar.js
"use client";

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { showToast } from '../utils/toastUtils';

const AdminAppBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          EnvisioXR Admin Panel
        </Typography>
        <IconButton color="inherit" onClick={() => showToast('Save action not yet implemented.')}> <SaveIcon /> </IconButton>
        <IconButton color="inherit"> <UndoIcon /> </IconButton>
        <IconButton color="inherit"> <RedoIcon /> </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AdminAppBar;