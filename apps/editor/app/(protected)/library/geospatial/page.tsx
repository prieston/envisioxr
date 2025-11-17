"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  alpha,
} from "@mui/material";
import { alpha as muiAlpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  textFieldStyles,
  showToast,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import type { LibraryAsset, MetadataRow } from "@envisio/ui";
import { AssetCard, AssetDetailView, DeleteConfirmDialog } from "@envisio/ui";
import { UploadToIonDrawer } from "./components/UploadToIonDrawer";
import {
  deleteModel,
  updateModelMetadata,
  getThumbnailUploadUrl,
  uploadToSignedUrl,
} from "@/app/utils/api";
import { AddIonAssetDrawer } from "./components/AddIonAssetDrawer";
import useModels from "@/app/hooks/useModels";
import { useTilingStatusPolling } from "@/app/hooks/useTilingStatusPolling";
import CesiumPreviewDialog from "./components/CesiumPreviewDialog";

const LibraryGeospatialPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    models: fetchedAssets,
    loadingModels,
    error: assetsError,
    mutate,
  } = useModels({
    assetType: "cesiumIonAsset",
  });

  // Poll for tiling status updates for assets that are IN_PROGRESS
  useTilingStatusPolling();
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const loading = loadingModels;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<LibraryAsset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedMetadata, setEditedMetadata] = useState<MetadataRow[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [uploadToIonDrawerOpen, setUploadToIonDrawerOpen] = useState(false);
  const [addIonAssetDrawerOpen, setAddIonAssetDrawerOpen] = useState(false);
  const [retakePhotoOpen, setRetakePhotoOpen] = useState(false);

  // Check for upload query param and open drawer
  useEffect(() => {
    if (searchParams.get("upload") === "true" && !uploadToIonDrawerOpen) {
      setUploadToIonDrawerOpen(true);
      // Remove the query param from URL
      router.replace("/library/geospatial");
    }
  }, [searchParams, uploadToIonDrawerOpen, router]);

  // Memoize mapped assets to prevent unnecessary re-renders
  const mappedAssets = useMemo(() => {
    return fetchedAssets
      .filter((asset) => asset.assetType === "cesiumIonAsset") // Only show Cesium Ion assets
      .map((asset) => ({
        id: asset.id,
        name: asset.name || asset.originalFilename || "",
        originalFilename: asset.originalFilename,
        fileUrl: asset.fileUrl,
        fileType: asset.fileType,
        thumbnail: asset.thumbnail,
        description: asset.description,
        metadata: asset.metadata as Record<string, string> | undefined,
        assetType: asset.assetType,
        cesiumAssetId: asset.cesiumAssetId,
        cesiumApiKey: asset.cesiumApiKey,
      }));
  }, [fetchedAssets]);

  // Use ref to track previous mapped assets to avoid unnecessary state updates
  const prevMappedAssetsRef = useRef<string>("");

  // Sync fetched assets to local state only when content actually changes
  useEffect(() => {
    const currentAssetsStr = JSON.stringify(mappedAssets);
    if (prevMappedAssetsRef.current !== currentAssetsStr) {
      prevMappedAssetsRef.current = currentAssetsStr;
      setAssets(mappedAssets);
    }
  }, [mappedAssets]);

  // Use ref to track previous selectedAsset to prevent infinite loops
  const prevSelectedAssetRef = useRef<LibraryAsset | null>(null);

  // Sync selectedAsset with updated data
  useEffect(() => {
    if (!selectedAsset) {
      prevSelectedAssetRef.current = null;
      return;
    }

    const updatedAsset = assets.find((a) => a.id === selectedAsset.id);
    if (!updatedAsset) {
      return;
    }

    // Only update if the asset data actually changed to prevent infinite loops
    const hasChanged =
      updatedAsset.name !== selectedAsset.name ||
      updatedAsset.description !== selectedAsset.description ||
      JSON.stringify(updatedAsset.metadata) !==
        JSON.stringify(selectedAsset.metadata) ||
      updatedAsset.thumbnail !== selectedAsset.thumbnail ||
      updatedAsset.fileUrl !== selectedAsset.fileUrl ||
      updatedAsset.cesiumAssetId !== selectedAsset.cesiumAssetId ||
      updatedAsset.cesiumApiKey !== selectedAsset.cesiumApiKey;

    // Also check if this is the same update we just did (prevent loop)
    const prevAsset = prevSelectedAssetRef.current;
    const isSameUpdate =
      prevAsset &&
      prevAsset.id === updatedAsset.id &&
      prevAsset.name === updatedAsset.name &&
      prevAsset.description === updatedAsset.description &&
      JSON.stringify(prevAsset.metadata) ===
        JSON.stringify(updatedAsset.metadata);

    if (hasChanged && !isSameUpdate) {
      prevSelectedAssetRef.current = updatedAsset;
      setSelectedAsset(updatedAsset);
    }

    if (!isEditing) {
      const newName = updatedAsset.name || updatedAsset.originalFilename || "";
      const newDescription = updatedAsset.description || "";
      const newMetadata: MetadataRow[] = updatedAsset.metadata
        ? Object.entries(updatedAsset.metadata).map(([label, value]) => ({
            label,
            value,
          }))
        : [];

      // Only update if values actually changed
      if (editedName !== newName) {
        setEditedName(newName);
      }
      if (editedDescription !== newDescription) {
        setEditedDescription(newDescription);
      }
      const currentMetadataStr = JSON.stringify(editedMetadata);
      const newMetadataStr = JSON.stringify(newMetadata);
      if (currentMetadataStr !== newMetadataStr) {
        setEditedMetadata(newMetadata);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, selectedAsset?.id, isEditing]);

  // Filter assets based on search query
  const filteredAssets = assets.filter((asset) => {
    const name = asset.name || asset.originalFilename || "";
    const description = asset.description || "";
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query)
    );
  });

  // Handle asset selection
  const handleAssetClick = (asset: LibraryAsset) => {
    prevSelectedAssetRef.current = asset;
    setSelectedAsset(asset);
    setIsEditing(false);
    setEditedName(asset.name || asset.originalFilename || "");
    setEditedDescription(asset.description || "");
    const metadataArray: MetadataRow[] = asset.metadata
      ? Object.entries(asset.metadata).map(([label, value]) => ({
          label,
          value,
        }))
      : [];
    setEditedMetadata(metadataArray);
  };

  // Handle edit
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!selectedAsset) return;

    try {
      const metadataObject = editedMetadata.reduce(
        (acc, row) => {
          if (row.label && row.value) {
            acc[row.label] = row.value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      await updateModelMetadata(selectedAsset.id, {
        name: editedName,
        description: editedDescription,
        metadata: metadataObject,
      });
      showToast("Geospatial asset updated successfully", "success");
      mutate(); // Refresh assets from SWR
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      showToast("An error occurred while updating asset", "error");
    }
  };

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAsset) return;

    try {
      await deleteModel(selectedAsset.id);
      showToast("Geospatial asset deleted successfully", "success");
      mutate(); // Refresh assets from SWR
      prevSelectedAssetRef.current = null;
      setSelectedAsset(null);
    } catch (error) {
      console.error("Delete error:", error);
      showToast("An error occurred during deletion", "error");
    }
    setDeleteConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  // Handle upload/add success
  const handleUploadSuccess = () => {
    mutate();
    setUploadToIonDrawerOpen(false);
  };

  const handleAddSuccess = () => {
    mutate();
    setAddIonAssetDrawerOpen(false);
  };

  // Handle retake photo
  const handleRetakePhoto = () => {
    setRetakePhotoOpen(true);
  };

  // Handle capture screenshot
  const handleCaptureScreenshot = async (screenshot: string) => {
    if (!selectedAsset) return;

    try {
      // Convert data URL to blob
      const response = await fetch(screenshot);
      const blob = await response.blob();

      const thumbnailFileName = `${selectedAsset.name || selectedAsset.originalFilename || "thumbnail"}-thumbnail.png`;

      // Get presigned URL for thumbnail
      const { signedUrl: thumbSignedUrl, acl: thumbAcl } =
        await getThumbnailUploadUrl({
          fileName: thumbnailFileName,
          fileType: "image/png",
        });

      // Upload thumbnail directly to S3
      await uploadToSignedUrl(thumbSignedUrl, blob, {
        contentType: "image/png",
        acl: thumbAcl,
      });

      // Extract thumbnail URL from signed URL (remove query parameters)
      const thumbnailUrl = thumbSignedUrl.split("?")[0];

      // Update asset metadata with thumbnail URL
      await updateModelMetadata(selectedAsset.id, {
        thumbnail: thumbnailUrl,
      });

      showToast("Thumbnail updated successfully", "success");
      mutate(); // Refresh assets
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while updating thumbnail",
        "error"
      );
    }
  };

  return (
    <>
      {/* Animated background */}
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      <Page>
        <PageHeader title="Geospatial Assets" />
        <PageDescription>
          Manage your Cesium Ion georeferenced assets, 3D Tiles, DEMs, and
          photogrammetry.
        </PageDescription>

        <PageContent maxWidth="6xl">
          {/* Search Toolbar */}
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: 2,
              mb: 3,
              pb: 3,
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Box
              sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}
            >
              <TextField
                placeholder="Search geospatial assets..."
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={(theme) => ({
                  maxWidth: "400px",
                  ...((typeof textFieldStyles === "function"
                    ? textFieldStyles(theme)
                    : textFieldStyles) as Record<string, unknown>),
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                        })}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={() => setUploadToIonDrawerOpen(true)}
                size="small"
                startIcon={<CloudUploadIcon />}
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#161B20"
                      : theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  border: `1px solid ${muiAlpha(theme.palette.primary.main, 0.3)}`,
                  padding: "6px 16px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#1a1f26"
                        : muiAlpha(theme.palette.primary.main, 0.05),
                    borderColor: muiAlpha(theme.palette.primary.main, 0.5),
                  },
                })}
              >
                Upload to Ion
              </Button>
              <Button
                variant="contained"
                onClick={() => setAddIonAssetDrawerOpen(true)}
                size="small"
                startIcon={<AddIcon />}
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#161B20"
                      : theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  border: `1px solid ${muiAlpha(theme.palette.primary.main, 0.3)}`,
                  padding: "6px 16px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#1a1f26"
                        : muiAlpha(theme.palette.primary.main, 0.05),
                    borderColor: muiAlpha(theme.palette.primary.main, 0.5),
                  },
                })}
              >
                Add Asset
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : assetsError ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                color: "error.main",
              }}
            >
              <Box sx={{ fontSize: "0.875rem", mb: 1 }}>
                Error loading geospatial assets
              </Box>
              <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {assetsError instanceof Error
                  ? assetsError.message
                  : "Unknown error"}
              </Box>
              <Button
                variant="outlined"
                onClick={() => mutate()}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", gap: 3, height: "calc(100vh - 300px)" }}
            >
              {/* Left Column - Asset Cards */}
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
                {filteredAssets.length === 0 ? (
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
                    <Box sx={{ textAlign: "center" }}>
                      {searchQuery ? (
                        <>
                          <Box sx={{ fontSize: "0.875rem", mb: 1 }}>
                            No geospatial assets found matching &quot;
                            {searchQuery}&quot;
                          </Box>
                          <Box sx={{ fontSize: "0.75rem" }}>
                            Try a different search term
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box sx={{ fontSize: "0.875rem", mb: 1 }}>
                            Your geospatial library is empty.
                          </Box>
                          <Box sx={{ fontSize: "0.75rem" }}>
                            Add Cesium Ion assets from the builder to get
                            started!
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Grid container spacing={1.5}>
                    {filteredAssets.map((asset) => (
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
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                  pl: 3,
                }}
              >
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
                    onAddToScene={() => {
                      // Not needed in geospatial page, but required by component
                    }}
                    onRetakePhoto={handleRetakePhoto}
                    canUpdate={true}
                    showAddToScene={false}
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
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ fontSize: "0.875rem", mb: 1 }}>
                        Select a geospatial asset to view details
                      </Box>
                      <Box sx={{ fontSize: "0.75rem" }}>
                        Click on an asset card to see its information
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </PageContent>
      </Page>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        assetName={selectedAsset?.name || selectedAsset?.originalFilename}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Upload to Ion Drawer */}
      <UploadToIonDrawer
        open={uploadToIonDrawerOpen}
        onClose={() => setUploadToIonDrawerOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Add Ion Asset Drawer */}
      <AddIonAssetDrawer
        open={addIonAssetDrawerOpen}
        onClose={() => setAddIonAssetDrawerOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Cesium Preview Dialog for Retaking Photo */}
      {selectedAsset &&
        selectedAsset.cesiumAssetId &&
        selectedAsset.cesiumApiKey && (
          <CesiumPreviewDialog
            open={retakePhotoOpen}
            onClose={() => setRetakePhotoOpen(false)}
            cesiumAssetId={selectedAsset.cesiumAssetId}
            cesiumApiKey={selectedAsset.cesiumApiKey}
            assetName={
              selectedAsset.name || selectedAsset.originalFilename || "Asset"
            }
            onCapture={handleCaptureScreenshot}
          />
        )}
    </>
  );
};

export default LibraryGeospatialPage;
