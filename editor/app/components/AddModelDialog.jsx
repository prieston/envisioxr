// src/components/AddModelDialog.jsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { showToast } from "../utils/toastUtils";
import useSceneStore from "../hooks/useSceneStore";

const stockModels = [
  {
    name: "House",
    url: "https://prieston-prod.fra1.cdn.digitaloceanspaces.com/general/house.glb",
    type: "glb",
  },
  {
    name: "CNC",
    url: "https://prieston-prod.fra1.cdn.digitaloceanspaces.com/general/cnc.glb",
    type: "glb",
  },
];

const AddModelDialog = ({ open, onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const addModel = useSceneStore((state) => state.addModel);

  // ✅ Handle stock model selection (Ensuring Default Position & Scale)
  const handleStockModelSelect = (model) => {
    addModel({
      name: model.name,
      url: model.url,
      type: model.type, // Pass the type (e.g., "3dm" or "glb")
      position: [0, 0, 0], // Default position in scene
      scale: [1, 1, 1], // Default scale
      rotation: [0, 0, 0], // Default rotation
    });
    showToast(`Added ${model.name} to scene.`);
    onClose();
  };

  // ✅ Handle file drop (currently not implemented)
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".glb",
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        showToast("Upload feature not implemented yet.");
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add a Model</DialogTitle>
      <DialogContent>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          centered
        >
          <Tab label="Stock Models" />
          <Tab label="Upload" />
        </Tabs>

        {/* Stock Models Tab */}
        {tabIndex === 0 && (
          <Box
            sx={{
              padding: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {stockModels.map((model, index) => (
              <Button
                key={index}
                variant="contained"
                fullWidth
                onClick={() => handleStockModelSelect(model)}
              >
                Add {model.name}
              </Button>
            ))}
          </Box>
        )}

        {/* Upload Tab */}
        {tabIndex === 1 && (
          <Box
            sx={{
              padding: 2,
              border: "2px dashed #aaa",
              textAlign: "center",
              cursor: "pointer",
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <Typography>
              Drag & drop a .glb file here, or click to select a file
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddModelDialog;
