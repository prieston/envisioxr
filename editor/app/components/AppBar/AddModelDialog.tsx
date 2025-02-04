"use client";

import React, { useState, useEffect } from "react";
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
import { showToast } from "../../utils/toastUtils";
import useSceneStore from "../../hooks/useSceneStore";

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
  const [userAssets, setUserAssets] = useState([]);
  const addModel = useSceneStore((state) => state.addModel);

  // When the dialog opens, fetch the user's uploaded models.
  useEffect(() => {
    if (open) {
      fetch("/api/models")
        .then((res) => res.json())
        .then((data) => {
          // Assuming the API returns { stockModels, assets }
          setUserAssets(data.assets || []);
        })
        .catch((err) => {
          console.error("Error fetching models:", err);
          showToast("Failed to load models");
        });
    }
  }, [open]);

  // Common handler for selecting a model.
  const handleModelSelect = (model) => {
    addModel({
      name: model.name,
      url: model.url,
      type: model.type, // e.g., "glb"
      position: [0, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    });
    showToast(`Added ${model.name} to scene.`);
    onClose();
  };

  // Delete model handler – calls DELETE endpoint and updates local state.
  const handleDeleteModel = async (assetId) => {
    try {
      const res = await fetch("/api/models", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (res.ok) {
        showToast("Asset deleted successfully.");
        // Update local state by removing the deleted asset.
        setUserAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      } else {
        showToast("Failed to delete asset.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("An error occurred during deletion.");
    }
  };

  // Handle file drop for uploads using a signed URL workflow.
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "model/gltf-binary": [".glb"] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        try {
          // Step 1: Request a signed URL via a PATCH call.
          const patchRes = await fetch("/api/models", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
            }),
          });
          if (!patchRes.ok) {
            showToast("Failed to get signed URL.");
            return;
          }
          const { signedUrl, key } = await patchRes.json();

          // Step 2: Upload the file directly to DigitalOcean Spaces using the signed URL.
          const putRes = await fetch(signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
              "x-amz-acl": "public-read", // Include the ACL header
            },
            body: file,
          });
          if (!putRes.ok) {
            showToast("File upload failed.");
            return;
          }

          // Step 3: Inform your backend to create a database record for the asset.
          const postRes = await fetch("/api/models", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key,
              originalFilename: file.name,
              fileType: "glb", // Or you can use file.type if needed.
            }),
          });
          if (!postRes.ok) {
            showToast("Failed to record the uploaded file.");
            return;
          }
          const postData = await postRes.json();
          showToast(`Uploaded ${file.name} successfully.`);
          // Step 4: Add the newly uploaded model to the scene.
          handleModelSelect({
            name: file.name,
            url: postData.asset.fileUrl,
            type: "glb",
          });
        } catch (error) {
          console.error("Upload error:", error);
          showToast("An error occurred during upload.");
        }
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
          <Tab label="My Models" />
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
                onClick={() => handleModelSelect(model)}
              >
                Add {model.name}
              </Button>
            ))}
          </Box>
        )}

        {/* My Models Tab */}
        {tabIndex === 1 && (
          <Box
            sx={{
              padding: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {userAssets.length === 0 ? (
              <Typography>No uploaded models found.</Typography>
            ) : (
              userAssets.map((model, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() =>
                      handleModelSelect({
                        name: model.originalFilename,
                        url: model.fileUrl,
                        type: model.fileType,
                      })
                    }
                  >
                    Add {model.originalFilename}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteModel(model.id)}
                  >
                    Delete
                  </Button>
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Upload Tab */}
        {tabIndex === 2 && (
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
