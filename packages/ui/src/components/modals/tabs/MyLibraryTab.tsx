"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import {
  Delete,
  Edit,
  Save,
  Close,
  AddCircleOutline,
  CameraAlt,
  Public,
  ViewInAr,
} from "@mui/icons-material";
import { MetadataTable, type MetadataRow } from "../../table";
import ModelPreviewDialog from "../ModelPreviewDialog";

export interface LibraryAsset {
  id: string;
  name: string;
  originalFilename?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  metadata?: Record<string, string>;
  fileUrl: string;
  fileType: string;
  description?: string;
  // Cesium Ion specific fields
  assetType?: "model" | "cesiumIonAsset";
  cesiumAssetId?: string;
  cesiumApiKey?: string;
}

interface MyLibraryTabProps {
  assets: LibraryAsset[];
  onAssetSelect: (asset: LibraryAsset) => void;
  onAssetDelete?: (assetId: string) => void;
  onAssetUpdate?: (
    assetId: string,
    updates: {
      name?: string;
      description?: string;
      metadata?: Record<string, string>;
      thumbnail?: string;
    }
  ) => void;
}

const MyLibraryTab: React.FC<MyLibraryTabProps> = ({
  assets,
  onAssetSelect,
  onAssetDelete,
  onAssetUpdate,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<LibraryAsset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedMetadata, setEditedMetadata] = useState<MetadataRow[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [retakePhotoOpen, setRetakePhotoOpen] = useState(false);

  // Sync selectedAsset with updated data from props
  useEffect(() => {
    if (selectedAsset) {
      const updatedAsset = assets.find((a) => a.id === selectedAsset.id);
      if (updatedAsset) {
        setSelectedAsset(updatedAsset);
        // If not editing, update the edited fields too
        if (!isEditing) {
          setEditedName(
            updatedAsset.name || updatedAsset.originalFilename || ""
          );
          setEditedDescription(updatedAsset.description || "");
          if (updatedAsset.metadata) {
            const metadataArray: MetadataRow[] = Object.entries(
              updatedAsset.metadata
            ).map(([label, value]) => ({ label, value }));
            setEditedMetadata(metadataArray);
          }
        }
      }
    }
  }, [assets, selectedAsset?.id]); // Only depend on assets and selectedAsset.id

  const handleAssetClick = (asset: LibraryAsset) => {
    setSelectedAsset(asset);
    setIsEditing(false);

    // Set editable fields
    setEditedName(asset.name || asset.originalFilename || "");
    setEditedDescription(asset.description || "");

    // Convert metadata object to array
    const metadataArray: MetadataRow[] = asset.metadata
      ? Object.entries(asset.metadata).map(([label, value]) => ({
          label,
          value,
        }))
      : [];
    setEditedMetadata(metadataArray);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values
    if (selectedAsset) {
      setEditedName(selectedAsset.name || selectedAsset.originalFilename || "");
      setEditedDescription(selectedAsset.description || "");

      if (selectedAsset.metadata) {
        const metadataArray: MetadataRow[] = Object.entries(
          selectedAsset.metadata
        ).map(([label, value]) => ({ label, value }));
        setEditedMetadata(metadataArray);
      }
    }
  };

  const handleSaveChanges = () => {
    if (selectedAsset && onAssetUpdate) {
      // Convert metadata array back to object
      const metadataObject = editedMetadata.reduce(
        (acc, row) => {
          if (row.label && row.value) {
            acc[row.label] = row.value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      onAssetUpdate(selectedAsset.id, {
        name: editedName,
        description: editedDescription,
        metadata: metadataObject,
      });

      setIsEditing(false);
    }
  };

  const handleAddToScene = () => {
    if (selectedAsset) {
      onAssetSelect(selectedAsset);
    }
  };

  const handleRetakePhoto = () => {
    setRetakePhotoOpen(true);
  };

  const handleCaptureScreenshot = (screenshot: string) => {
    if (selectedAsset && onAssetUpdate) {
      onAssetUpdate(selectedAsset.id, {
        thumbnail: screenshot,
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAsset && onAssetDelete) {
      onAssetDelete(selectedAsset.id);
      setSelectedAsset(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
      {/* Left Column - Asset Grid */}
      <Box
        sx={{
          flex: "0 0 40%",
          overflowY: "auto",
          paddingRight: 1,
        }}
      >
        {assets.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "rgba(100, 116, 139, 0.6)",
            }}
          >
            <Typography variant="body2" align="center">
              Your library is empty.
              <br />
              Upload a model to get started!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {assets.map((asset) => (
              <Grid item xs={4} key={asset.id}>
                <Card
                  onClick={() => handleAssetClick(asset)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border:
                      selectedAsset?.id === asset.id
                        ? "2px solid var(--color-primary, #6B9CD8)"
                        : "2px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(107, 156, 216, 0.18)",
                      borderColor:
                        selectedAsset?.id === asset.id
                          ? "var(--color-primary, #6B9CD8)"
                          : "rgba(107, 156, 216, 0.35)",
                    },
                  }}
                >
                  {asset.thumbnailUrl || asset.thumbnail ? (
                    <CardMedia
                      component="img"
                      height="80"
                      image={asset.thumbnailUrl || asset.thumbnail}
                      alt={asset.name || asset.originalFilename}
                      sx={{
                        objectFit: "cover",
                        backgroundColor: "rgba(248, 250, 252, 0.8)",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(248, 250, 252, 0.8)",
                      }}
                    >
                      {asset.assetType === "cesiumIonAsset" ? (
                        <Public
                          sx={{
                            fontSize: "2.5rem",
                            color: "var(--color-primary, #6B9CD8)",
                          }}
                        />
                      ) : (
                        <ViewInAr
                          sx={{
                            fontSize: "2.5rem",
                            color: "rgba(100, 116, 139, 0.4)",
                          }}
                        />
                      )}
                    </Box>
                  )}
                  <CardContent sx={{ padding: "8px !important" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        minHeight: "42px",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        noWrap
                        sx={{
                          fontSize: "0.75rem",
                          color: "rgba(51, 65, 85, 0.95)",
                        }}
                      >
                        {asset.name || asset.originalFilename}
                      </Typography>
                      {asset.assetType === "cesiumIonAsset" && (
                        <Chip
                          icon={<Public />}
                          label="Cesium Ion"
                          size="small"
                          sx={{
                            height: "18px",
                            fontSize: "0.625rem",
                            fontWeight: 500,
                            color: "var(--color-primary, #6B9CD8)",
                            backgroundColor: "rgba(107, 156, 216, 0.12)",
                            "& .MuiChip-icon": {
                              fontSize: "0.75rem",
                              color: "var(--color-primary, #6B9CD8)",
                            },
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Divider */}
      <Divider orientation="vertical" flexItem />

      {/* Right Column - Details */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedAsset ? (
          <>
            {/* Scrollable Content */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                padding: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Asset Info */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {/* Thumbnail */}
                <Box
                  sx={{
                    width: "120px",
                    height: "120px",
                    flexShrink: 0,
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "rgba(226, 232, 240, 0.3)",
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    cursor: onAssetUpdate ? "pointer" : "default",
                    "&:hover .retake-overlay": {
                      opacity: 1,
                    },
                  }}
                >
                  {selectedAsset.thumbnail || selectedAsset.thumbnailUrl ? (
                    <img
                      src={
                        selectedAsset.thumbnail || selectedAsset.thumbnailUrl
                      }
                      alt={selectedAsset.name || selectedAsset.originalFilename}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "0.625rem",
                        color: "rgba(100, 116, 139, 0.5)",
                        fontStyle: "italic",
                      }}
                    >
                      No preview
                    </Typography>
                  )}

                  {/* Hover Overlay */}
                  {onAssetUpdate && (
                    <Box
                      className="retake-overlay"
                      onClick={handleRetakePhoto}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 0.5,
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <CameraAlt sx={{ color: "white", fontSize: "2rem" }} />
                      <Typography
                        sx={{
                          color: "white",
                          fontSize: "0.625rem",
                          fontWeight: 500,
                        }}
                      >
                        Retake Photo
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Name and Description */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgba(51, 65, 85, 0.95)",
                          mb: 0.5,
                        }}
                      >
                        Name
                      </Typography>
                      <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{
                          mb: 1.5,
                          "& .MuiInputBase-input": {
                            fontSize: "1rem",
                            fontWeight: 600,
                            padding: "8px 12px",
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgba(51, 65, 85, 0.95)",
                          mb: 0.5,
                        }}
                      >
                        Description
                      </Typography>
                      <TextField
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Add a description..."
                        sx={{
                          mb: 1.5,
                          "& .MuiInputBase-input": {
                            fontSize: "0.813rem",
                            padding: "8px 12px",
                          },
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "rgba(51, 65, 85, 0.95)",
                          mb: 0.5,
                        }}
                      >
                        {selectedAsset.name || selectedAsset.originalFilename}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.813rem",
                          color: selectedAsset.description
                            ? "rgba(100, 116, 139, 0.9)"
                            : "rgba(100, 116, 139, 0.5)",
                          mb: 0.5,
                          lineHeight: 1.4,
                          fontStyle: selectedAsset.description
                            ? "normal"
                            : "italic",
                        }}
                      >
                        {selectedAsset.description || "No description"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.75rem",
                          color: "rgba(100, 116, 139, 0.8)",
                        }}
                      >
                        {selectedAsset.fileType}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {/* Metadata Table */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "0.813rem",
                    fontWeight: 600,
                    color: "rgba(51, 65, 85, 0.95)",
                    mb: 1,
                  }}
                >
                  Metadata
                </Typography>
                <MetadataTable
                  data={editedMetadata}
                  editable={isEditing}
                  onChange={setEditedMetadata}
                />
              </Box>
            </Box>

            {/* Fixed Action Bar */}
            <Box
              sx={{
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                padding: 2,
                backgroundColor: "rgba(20, 23, 26, 0.88)",
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<AddCircleOutline />}
                onClick={handleAddToScene}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                borderColor: "rgba(107, 156, 216, 0.35)",
                color: "var(--color-primary, #6B9CD8)",
                  padding: "6px 16px",
                  "&:hover": {
                  borderColor: "var(--color-primary, #6B9CD8)",
                  backgroundColor: "rgba(107, 156, 216, 0.12)",
                  },
                }}
              >
                Add to Scene
              </Button>

              <Box sx={{ flex: 1 }} />

              {!isEditing ? (
                <IconButton
                  onClick={handleEditClick}
                  size="small"
                  sx={{
                    color: "rgba(100, 116, 139, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "6px",
                    "&:hover": {
                        backgroundColor: "rgba(107, 156, 216, 0.12)",
                        borderColor: "var(--color-primary, #6B9CD8)",
                        color: "var(--color-primary, #6B9CD8)",
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <IconButton
                    onClick={handleSaveChanges}
                    size="small"
                    sx={{
                      color: "var(--color-primary, #6B9CD8)",
                      border: "1px solid rgba(107, 156, 216, 0.35)",
                      borderRadius: "8px",
                      padding: "6px",
                      "&:hover": {
                        backgroundColor: "rgba(107, 156, 216, 0.14)",
                        borderColor: "var(--color-primary, #6B9CD8)",
                      },
                    }}
                  >
                    <Save fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleCancelEdit}
                    size="small"
                    sx={{
                      color: "rgba(100, 116, 139, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      padding: "6px",
                      "&:hover": {
                        backgroundColor: "rgba(100, 116, 139, 0.1)",
                        borderColor: "rgba(100, 116, 139, 0.8)",
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </>
              )}
              <IconButton
                onClick={handleDeleteClick}
                size="small"
                sx={{
                  color: "rgba(100, 116, 139, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "6px",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "#ef4444",
                    color: "#ef4444",
                  },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "rgba(100, 116, 139, 0.6)",
            }}
          >
            <Typography variant="body2" align="center">
              Select an asset to view details
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow:
              "0 8px 32px rgba(95, 136, 199, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
            pb: 1,
          }}
        >
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.9)",
              lineHeight: 1.5,
            }}
          >
            Are you sure you want to delete "
            <strong>
              {selectedAsset?.name || selectedAsset?.originalFilename}
            </strong>
            "? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              textTransform: "none",
              fontSize: "0.813rem",
              fontWeight: 500,
              color: "rgba(100, 116, 139, 0.8)",
              "&:hover": {
                backgroundColor: "rgba(100, 116, 139, 0.08)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: "0.813rem",
              fontWeight: 500,
              backgroundColor: "#ef4444",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
              "&:hover": {
                backgroundColor: "#dc2626",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Preview Dialog for Retaking Photo */}
      {selectedAsset && (
        <ModelPreviewDialog
          open={retakePhotoOpen}
          onClose={() => setRetakePhotoOpen(false)}
          modelUrl={selectedAsset.fileUrl}
          modelName={
            selectedAsset.name || selectedAsset.originalFilename || "Model"
          }
          onCapture={handleCaptureScreenshot}
        />
      )}
    </Box>
  );
};

export default MyLibraryTab;
