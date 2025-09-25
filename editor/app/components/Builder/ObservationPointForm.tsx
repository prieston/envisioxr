"use client";
// src/components/ObservationPointForm.js
import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { showToast } from "@envisio/core/utils";

const ObservationPointForm = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Add Observation Point</Typography>
      <TextField label="Name" fullWidth margin="normal" />
      <TextField
        label="Description"
        multiline
        rows={4}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          showToast("Observation point saving not yet implemented.")
        }
      >
        Save
      </Button>
    </Box>
  );
};

export default ObservationPointForm;
