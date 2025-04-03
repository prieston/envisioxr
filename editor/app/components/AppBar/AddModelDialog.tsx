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
  TextField,
  Tooltip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import useSceneStore from "@/app/hooks/useSceneStore";
import { showToast } from "@/app/utils/toastUtils";
import ModelPreview from "../ModelPreview";
import { doSpaces } from "@/lib/env";

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
  const [previewFile, setPreviewFile] = useState(null); // Model file from dropzone
  const [previewUrl, setPreviewUrl] = useState(null); // Object URL for preview
  const [screenshot, setScreenshot] = useState(null); // Captured thumbnail data URL
  const [friendlyName, setFriendlyName] = useState(""); // User-provided friendly name
  const [uploading, setUploading] = useState(false); // Upload spinner state
  const [uploadProgress, setUploadProgress] = useState(0); // Upload progress percentage
  const [deletingAssetId, setDeletingAssetId] = useState(null); // Currently deleting asset id
  const addModel = useSceneStore((state) => state.addModel);

  // Fetch user's uploaded models when dialog opens.
  useEffect(() => {
    if (open) {
      fetch("/api/models")
        .then((res) => res.json())
        .then((data) => {
          setUserAssets(data.assets || []);
        })
        .catch((err) => {
          console.error("Error fetching models:", err);
          showToast("Failed to load models");
        });
    }
  }, [open]);

  // Handler for selecting a model (stock or uploaded).
  const handleModelSelect = (model) => {
    addModel({
      name: model.name,
      url: model.url,
      type: model.type,
      position: [0, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    });
    onClose();
  };

  // Delete model handler.
  const handleDeleteModel = async (assetId) => {
    setDeletingAssetId(assetId);
    try {
      const res = await fetch("/api/models", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (res.ok) {
        showToast("Asset deleted successfully.");
        setUserAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      } else {
        showToast("Failed to delete asset.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("An error occurred during deletion.");
    } finally {
      setDeletingAssetId(null);
    }
  };

  // Handle file drop.
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "model/gltf-binary": [".glb"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(file);
        setPreviewFile(file);
        setPreviewUrl(objectUrl);
        setScreenshot(null); // Reset previous thumbnail.
      }
    },
  });

  // Convert a data URL to a Blob.
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Helper function to upload a file using a signed URL with progress.
  const uploadFileWithProgress = async (
    file: File | Blob,
    fileName: string,
    fileType: string,
    onProgress: (progress: number) => void
  ): Promise<{ key: string; publicUrl: string }> => {
    // Step 1: Get a signed URL.
    const patchRes = await fetch("/api/models", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType }),
    });
    if (!patchRes.ok) {
      throw new Error(`Failed to get signed URL for ${fileName}`);
    }
    const { signedUrl, key } = await patchRes.json();

    // Step 2: Upload using XMLHttpRequest for progress tracking.
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", fileType);
      xhr.setRequestHeader("x-amz-acl", "public-read");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentCompleted = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentCompleted);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const endpoint = doSpaces.publicEndpoint;
          const bucket = doSpaces.publicBucket;
          const publicUrl = `${endpoint}/${bucket}/${key}`;
          resolve({ key, publicUrl });
        } else {
          reject(new Error("Upload failed with status " + xhr.status));
        }
      };

      xhr.onerror = () => reject(new Error("File upload failed (XHR error)"));
      xhr.send(file);
    });
  };

  // Handle confirmation: upload model file and thumbnail, then record asset.
  const handleConfirmUpload = async () => {
    if (!previewFile || !screenshot || !friendlyName) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      // Upload the model file with progress.
      const modelUpload = await uploadFileWithProgress(
        previewFile,
        previewFile.name,
        previewFile.type,
        setUploadProgress
      );
      // Upload the thumbnail.
      const thumbnailBlob = dataURLtoBlob(screenshot);
      const thumbnailFileName = friendlyName + "-thumbnail.png";
      const thumbnailUpload = (await uploadFileWithProgress(
        thumbnailBlob,
        thumbnailFileName,
        "image/png",
        null
      )) as { key: string; publicUrl: string };

      // Create the database record including the thumbnail URL.
      const postRes = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: modelUpload.key,
          originalFilename: friendlyName,
          fileType: previewFile.type,
          thumbnail: thumbnailUpload.publicUrl,
        }),
      });
      if (!postRes.ok) {
        showToast("Failed to record the uploaded file.");
        return;
      }
      const postData = await postRes.json();
      showToast(`Uploaded ${friendlyName} successfully.`);
      handleModelSelect({
        name: friendlyName,
        url: postData.asset.fileUrl,
        type: previewFile.type,
      });
      // Clear state.
      setPreviewFile(null);
      setPreviewUrl(null);
      setScreenshot(null);
      setFriendlyName("");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("An error occurred during upload.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Disable confirm if no thumbnail, friendly name, or if uploading.
  const isConfirmDisabled = !screenshot || !friendlyName || uploading;

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

        {/* My Models Tab as Card Items */}
        {tabIndex === 1 && (
          <Box sx={{ padding: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {userAssets.length === 0 ? (
              <Typography>No uploaded models found.</Typography>
            ) : (
              userAssets.map((model, index) => (
                <Card key={index} sx={{ width: 250 }}>
                  {model.thumbnail && (
                    <CardMedia
                      style={{ background: "white" }}
                      component="img"
                      height="140"
                      image={model.thumbnail}
                      alt={model.originalFilename}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">
                      {model.originalFilename}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() =>
                        handleModelSelect({
                          name: model.originalFilename,
                          url: model.fileUrl,
                          type: model.fileType,
                        })
                      }
                    >
                      Add Model
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteModel(model.id)}
                      disabled={deletingAssetId === model.id}
                    >
                      {deletingAssetId === model.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Upload Tab */}
        {tabIndex === 2 && (
          <Box sx={{ padding: 2 }}>
            {previewUrl ? (
              <>
                <ModelPreview
                  fileUrl={previewUrl}
                  type="glb"
                  onScreenshotCaptured={setScreenshot}
                />
                <TextField
                  label="Friendly Name"
                  fullWidth
                  value={friendlyName}
                  onChange={(e) => setFriendlyName(e.target.value)}
                  sx={{ my: 2 }}
                />
                {uploading && (
                  <Box sx={{ my: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      align="center"
                    >
                      {uploadProgress}% uploaded
                    </Typography>
                  </Box>
                )}
                <Tooltip
                  title={
                    isConfirmDisabled
                      ? "Capture thumbnail and enter a friendly name first"
                      : ""
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={isConfirmDisabled}
                      onClick={handleConfirmUpload}
                    >
                      {uploading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Confirm Upload"
                      )}
                    </Button>
                  </span>
                </Tooltip>
              </>
            ) : (
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
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddModelDialog;
