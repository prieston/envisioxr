"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, alpha } from "@mui/material";
import type { MetadataRow } from "../../table";
import ModelPreviewDialog from "../ModelPreviewDialog";
import { AssetCard } from "./my-library/AssetCard";
import { AssetDetailView } from "./my-library/AssetDetailView";
import { DeleteConfirmDialog } from "./my-library/DeleteConfirmDialog";

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
  fileSize?: number | null;
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
  }, [assets, selectedAsset?.id, isEditing]);

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
        sx={(theme) => ({
          flex: "0 0 40%",
          overflowY: "auto",
          paddingRight: 1,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.08)
                : "rgba(95, 136, 199, 0.05)",
            borderRadius: "4px",
            margin: "4px 0",
          },
          "&::-webkit-scrollbar-thumb": {
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.24)
                : "rgba(95, 136, 199, 0.2)",
            borderRadius: "4px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
            transition: "background 0.2s ease",
            "&:hover": {
              background:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.38)
                  : "rgba(95, 136, 199, 0.35)",
              backgroundClip: "padding-box",
            },
          },
        })}
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
                <AssetCard
                  asset={asset}
                  isSelected={selectedAsset?.id === asset.id}
                  onClick={() => handleAssetClick(asset)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Right Column - Asset Details */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {selectedAsset ? (
          <AssetDetailView
            asset={selectedAsset}
            isEditing={isEditing}
            editedName={editedName}
            editedDescription={editedDescription}
            editedMetadata={editedMetadata}
            onNameChange={setEditedName}
            onDescriptionChange={setEditedDescription}
            onMetadataChange={setEditedMetadata}
            onEditClick={handleEditClick}
            onCancelEdit={handleCancelEdit}
            onSaveChanges={handleSaveChanges}
            onDeleteClick={handleDeleteClick}
            onAddToScene={handleAddToScene}
            onRetakePhoto={handleRetakePhoto}
            canUpdate={!!onAssetUpdate}
          />
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
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        assetName={selectedAsset?.name || selectedAsset?.originalFilename}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

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
