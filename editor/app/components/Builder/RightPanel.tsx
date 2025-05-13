"use client";

import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Divider,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Camera } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";
import ModelPreview from "../ModelPreview";
import { useDropzone } from "react-dropzone";
import { showToast } from "@/app/utils/toastUtils";
import * as THREE from "three";
import { clientEnv } from "@/lib/env/client";

// Styled container for the RightPanel with conditional styles based on previewMode
interface RightPanelContainerProps {
  previewMode: boolean;
}

type Vector3Tuple = [number, number, number];

const RightPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<RightPanelContainerProps>(({ theme, previewMode }) => ({
  width: "280px",
  height: "100%",
  backgroundColor: "#121212",
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "all 0.3s ease",
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "calc(100% - 48px)", // 48px is the height of the tabs
  overflow: "auto",
}));

const PropertyGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const PropertyLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

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

const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [userAssets, setUserAssets] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingAssetId, setDeletingAssetId] = useState(null);
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number, number] | null
  >(null);
  const [pendingModel, setPendingModel] = useState(null);

  const {
    selectedObject,
    updateObjectProperty,
    previewMode,
    selectedObservation,
    updateObservationPoint,
    deleteObservationPoint,
    setCapturingPOV,
    viewMode,
    controlSettings,
    updateControlSettings,
    addModel,
    orbitControlsRef,
    scene,
  } = useSceneStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePropertyChange = (property: string, value: number | string) => {
    if (selectedObject) {
      updateObjectProperty(selectedObject.id, property, value);
    }
  };

  const handleObservationChange = (
    property: string,
    value: string | Vector3Tuple
  ) => {
    console.log("handleObservationChange", property, value);
    if (selectedObservation) {
      updateObservationPoint(selectedObservation.id, { [property]: value });
    }
  };

  // Fetch user's uploaded models when component mounts
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        setUserAssets(data.assets || []);
      })
      .catch((err) => {
        console.error("Error fetching models:", err);
        showToast("Failed to load models");
      });
  }, []);

  // Handle position selection mode
  useEffect(() => {
    debugger; //eslint-disable-line
    if (!selectingPosition || !orbitControlsRef || !scene) return;

    const handleClick = (event) => {
      const rect = event.target.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      console.log("Mouse coordinates:", { x: mouse.x, y: mouse.y });

      // Update the raycaster
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, orbitControlsRef.object);
      console.log("Camera position:", orbitControlsRef.object.position);

      // Get all objects in the scene
      const allObjects = [];
      scene.traverse((object) => {
        if (object.isMesh) {
          allObjects.push(object);
        }
      });
      console.log("Found meshes for raycasting:", allObjects.length);

      // Find intersections with all objects
      const intersects = raycaster.intersectObjects(allObjects, true);
      console.log("Intersections found:", intersects.length);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        console.log("Hit point:", hitPoint);
        setSelectedPosition([hitPoint.x, hitPoint.y, hitPoint.z]);
        setSelectingPosition(false); // Close the first box
        showToast("Position selected!");
      } else {
        console.log("No intersections found");
        showToast("No surface detected at click point");
      }
    };

    const canvas = document.querySelector("canvas");
    if (canvas) {
      console.log("Adding click listener to canvas");
      canvas.addEventListener("click", handleClick);
      canvas.style.cursor = "crosshair";
    } else {
      console.log("Canvas element not found");
    }

    return () => {
      if (canvas) {
        console.log("Removing click listener from canvas");
        canvas.removeEventListener("click", handleClick);
        canvas.style.cursor = "auto";
      }
    };
  }, [selectingPosition, orbitControlsRef, scene]);

  // Add a new effect to handle position updates after initial selection
  useEffect(() => {
    if (!selectedPosition || !orbitControlsRef || !scene) return;

    const handleClick = (event) => {
      const rect = event.target.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, orbitControlsRef.object);

      const allObjects = [];
      scene.traverse((object) => {
        if (object.isMesh) {
          allObjects.push(object);
        }
      });

      const intersects = raycaster.intersectObjects(allObjects, true);
      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        setSelectedPosition([hitPoint.x, hitPoint.y, hitPoint.z]);
        showToast("Position updated!");
      }
    };

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("click", handleClick);
      canvas.style.cursor = "crosshair";
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
        canvas.style.cursor = "auto";
      }
    };
  }, [selectedPosition, orbitControlsRef, scene]);

  const handleModelSelect = (model) => {
    // Store the model temporarily
    const pendingModel = {
      name: model.name,
      url: model.url,
      type: model.type,
      position: [0, 0, 0], // Default position, will be updated on click
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    };

    // Show confirmation UI
    setPendingModel(pendingModel);
    setSelectingPosition(true);
    showToast("Click anywhere in the scene to select the insertion point");
  };

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

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "model/gltf-binary": [".glb"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(file);
        setPreviewFile(file);
        setPreviewUrl(objectUrl);
        setScreenshot(null);
      }
    },
  });

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

  const uploadFileWithProgress = async (
    file: File | Blob,
    fileName: string,
    fileType: string,
    onProgress: (progress: number) => void
  ): Promise<{ key: string; publicUrl: string }> => {
    const patchRes = await fetch("/api/models", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType }),
    });
    if (!patchRes.ok) {
      throw new Error(`Failed to get signed URL for ${fileName}`);
    }
    const { signedUrl, key } = await patchRes.json();

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
          const endpoint = clientEnv.NEXT_PUBLIC_DO_SPACES_ENDPOINT;
          const bucket = clientEnv.NEXT_PUBLIC_DO_SPACES_BUCKET;
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

  const handleConfirmUpload = async () => {
    if (!previewFile || !screenshot || !friendlyName) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const modelUpload = await uploadFileWithProgress(
        previewFile,
        previewFile.name,
        previewFile.type,
        setUploadProgress
      );
      const thumbnailBlob = dataURLtoBlob(screenshot);
      const thumbnailFileName = friendlyName + "-thumbnail.png";
      const thumbnailUpload = await uploadFileWithProgress(
        thumbnailBlob,
        thumbnailFileName,
        "image/png",
        null
      );

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

  const isConfirmDisabled = !screenshot || !friendlyName || uploading;

  // Add new handler for confirming model placement
  const handleConfirmModelPlacement = () => {
    if (pendingModel && selectedPosition) {
      addModel({
        ...pendingModel,
        position: selectedPosition,
      });
      setPendingModel(null);
      setSelectedPosition(null);
      setSelectingPosition(false);
    }
  };

  // Add new handler for canceling model placement
  const handleCancelModelPlacement = () => {
    setPendingModel(null);
    setSelectedPosition(null);
    setSelectingPosition(false);
  };

  return (
    <RightPanelContainer previewMode={previewMode}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Properties" />
        <Tab label="Assets" />
      </Tabs>

      {/* Properties Inspector Tab */}
      <TabPanel role="tabpanel" hidden={activeTab !== 0}>
        {viewMode === "settings" ? (
          // Control Settings Panel
          <PropertyGroup>
            <Typography variant="subtitle1" gutterBottom>
              Control Settings
            </Typography>

            <PropertyLabel>Car Speed</PropertyLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={controlSettings.carSpeed}
              onChange={(e) =>
                updateControlSettings({ carSpeed: Number(e.target.value) })
              }
              sx={{ mb: 2 }}
            />

            <PropertyLabel>Walk Speed</PropertyLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={controlSettings.walkSpeed}
              onChange={(e) =>
                updateControlSettings({ walkSpeed: Number(e.target.value) })
              }
              sx={{ mb: 2 }}
            />

            <PropertyLabel>Flight Speed</PropertyLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={controlSettings.flightSpeed}
              onChange={(e) =>
                updateControlSettings({ flightSpeed: Number(e.target.value) })
              }
              sx={{ mb: 2 }}
            />

            <PropertyLabel>Turn Speed</PropertyLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={controlSettings.turnSpeed}
              onChange={(e) =>
                updateControlSettings({ turnSpeed: Number(e.target.value) })
              }
              sx={{ mb: 2 }}
            />

            <PropertyLabel>Smoothness</PropertyLabel>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={controlSettings.smoothness}
              onChange={(e) =>
                updateControlSettings({ smoothness: Number(e.target.value) })
              }
              sx={{ mb: 2 }}
            />
          </PropertyGroup>
        ) : selectedObservation ? (
          // Observation Point Properties
          <>
            <PropertyGroup>
              <Typography variant="subtitle1" gutterBottom>
                Observation Point Settings
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Title"
                value={selectedObservation.title || ""}
                onChange={(e) =>
                  handleObservationChange("title", e.target.value)
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Description"
                multiline
                rows={4}
                value={selectedObservation.description || ""}
                onChange={(e) =>
                  handleObservationChange("description", e.target.value)
                }
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setCapturingPOV(true)}
                startIcon={<Camera />}
                sx={{ mb: 2 }}
              >
                Capture Camera Position
              </Button>
              {selectedObservation.position && (
                <>
                  <PropertyLabel>Position</PropertyLabel>
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      label="X"
                      type="number"
                      value={selectedObservation.position[0]}
                      onChange={(e) => {
                        const newPosition: Vector3Tuple = [
                          Number(e.target.value),
                          selectedObservation.position![1],
                          selectedObservation.position![2],
                        ];
                        handleObservationChange("position", newPosition);
                      }}
                    />
                    <TextField
                      size="small"
                      label="Y"
                      type="number"
                      value={selectedObservation.position[1]}
                      onChange={(e) => {
                        const newPosition: Vector3Tuple = [
                          selectedObservation.position![0],
                          Number(e.target.value),
                          selectedObservation.position![2],
                        ];
                        handleObservationChange("position", newPosition);
                      }}
                    />
                    <TextField
                      size="small"
                      label="Z"
                      type="number"
                      value={selectedObservation.position[2]}
                      onChange={(e) => {
                        const newPosition: Vector3Tuple = [
                          selectedObservation.position![0],
                          selectedObservation.position![1],
                          Number(e.target.value),
                        ];
                        handleObservationChange("position", newPosition);
                      }}
                    />
                  </Box>
                </>
              )}
              {selectedObservation.target && (
                <>
                  <PropertyLabel>Look At Target</PropertyLabel>
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      label="X"
                      type="number"
                      value={selectedObservation.target[0]}
                      onChange={(e) => {
                        const newTarget: Vector3Tuple = [
                          Number(e.target.value),
                          selectedObservation.target![1],
                          selectedObservation.target![2],
                        ];
                        handleObservationChange("target", newTarget);
                      }}
                    />
                    <TextField
                      size="small"
                      label="Y"
                      type="number"
                      value={selectedObservation.target[1]}
                      onChange={(e) => {
                        const newTarget: Vector3Tuple = [
                          selectedObservation.target![0],
                          Number(e.target.value),
                          selectedObservation.target![2],
                        ];
                        handleObservationChange("target", newTarget);
                      }}
                    />
                    <TextField
                      size="small"
                      label="Z"
                      type="number"
                      value={selectedObservation.target[2]}
                      onChange={(e) => {
                        const newTarget: Vector3Tuple = [
                          selectedObservation.target![0],
                          selectedObservation.target![1],
                          Number(e.target.value),
                        ];
                        handleObservationChange("target", newTarget);
                      }}
                    />
                  </Box>
                </>
              )}
              <Button
                color="error"
                onClick={() => deleteObservationPoint(selectedObservation.id)}
                sx={{ mt: 2 }}
              >
                Delete Observation Point
              </Button>
            </PropertyGroup>
          </>
        ) : selectedObject ? (
          // Object Properties
          <>
            <PropertyGroup>
              <Typography variant="subtitle1" gutterBottom>
                Transform
              </Typography>
              <PropertyLabel>Position</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObject.position[0]}
                  onChange={(e) =>
                    handlePropertyChange("position.0", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObject.position[1]}
                  onChange={(e) =>
                    handlePropertyChange("position.1", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObject.position[2]}
                  onChange={(e) =>
                    handlePropertyChange("position.2", Number(e.target.value))
                  }
                />
              </Box>

              <PropertyLabel>Rotation</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObject.rotation?.[0] || 0}
                  onChange={(e) =>
                    handlePropertyChange("rotation.0", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObject.rotation?.[1] || 0}
                  onChange={(e) =>
                    handlePropertyChange("rotation.1", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObject.rotation?.[2] || 0}
                  onChange={(e) =>
                    handlePropertyChange("rotation.2", Number(e.target.value))
                  }
                />
              </Box>

              <PropertyLabel>Scale</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObject.scale?.[0] || 1}
                  onChange={(e) =>
                    handlePropertyChange("scale.0", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObject.scale?.[1] || 1}
                  onChange={(e) =>
                    handlePropertyChange("scale.1", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObject.scale?.[2] || 1}
                  onChange={(e) =>
                    handlePropertyChange("scale.2", Number(e.target.value))
                  }
                />
              </Box>
            </PropertyGroup>

            <Divider sx={{ my: 2 }} />

            <PropertyGroup>
              <Typography variant="subtitle1" gutterBottom>
                Material
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Color"
                type="color"
                value={selectedObject.material?.color || "#ffffff"}
                onChange={(e) =>
                  handlePropertyChange("material.color", e.target.value)
                }
              />
            </PropertyGroup>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select an object or observation point to view its properties
          </Typography>
        )}
      </TabPanel>

      {/* Asset Library Tab */}
      <TabPanel role="tabpanel" hidden={activeTab !== 1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1">Asset Library</Typography>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Stock Models" />
          <Tab label="Your Models" />
          <Tab label="Upload Model" />
        </Tabs>

        {selectingPosition && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "warning.light",
              borderRadius: 1,
              position: "relative",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Click anywhere in the scene to select where to place the model
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The point will be shown in the panel for confirmation
            </Typography>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setSelectingPosition(false);
                setSelectedPosition(null);
              }}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              ✕
            </Button>
          </Box>
        )}

        {selectedPosition && pendingModel && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "success.light",
              borderRadius: 1,
              position: "relative",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Selected Position for {pendingModel.name}:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              X: {selectedPosition[0].toFixed(2)}
              <br />
              Y: {selectedPosition[1].toFixed(2)}
              <br />
              Z: {selectedPosition[2].toFixed(2)}
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleConfirmModelPlacement}
              >
                Confirm Placement
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={handleCancelModelPlacement}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {/* Stock Models Tab */}
        {tabIndex === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {userAssets.length === 0 ? (
              <Typography>No uploaded models found.</Typography>
            ) : (
              userAssets.map((model, index) => (
                <Card key={index} sx={{ width: "100%" }}>
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
          <Box>
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
      </TabPanel>
    </RightPanelContainer>
  );
};

export default RightPanel;
