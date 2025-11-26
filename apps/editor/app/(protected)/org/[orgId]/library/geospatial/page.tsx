/* eslint-disable no-console */
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
  Select,
  MenuItem,
} from "@mui/material";
import { alpha as muiAlpha } from "@mui/material/styles";
import { SearchIcon, CloudUploadIcon, AddIcon } from "@klorad/ui";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  textFieldStyles,
  selectStyles,
  menuItemStyles,
  showToast,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

interface AssetType {
  value: string;
  label: string;
}
import type { LibraryAsset, MetadataRow } from "@klorad/ui";
import { AssetCard, AssetDetailView, DeleteConfirmDialog } from "@klorad/ui";
import { UploadToIonDrawer } from "./components/UploadToIonDrawer";
import {
  deleteModel,
  updateModelMetadata,
  updateModelTransform,
  getThumbnailUploadUrl,
  uploadToSignedUrl,
} from "@/app/utils/api";
import { AddIonAssetDrawer } from "./components/AddIonAssetDrawer";
import useModels from "@/app/hooks/useModels";
import { useTilingStatusPolling } from "@/app/hooks/useTilingStatusPolling";
import CesiumPreviewDialog from "./components/CesiumPreviewDialog";
import AdjustTilesetLocationDialog from "./components/AdjustTilesetLocationDialog";
import { useSceneStore } from "@klorad/core";

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
  const [selectedType, setSelectedType] = useState<string>("");

  // Cesium Ion asset types - all supported types
  const cesiumAssetTypes: AssetType[] = [
    { value: "IMAGERY", label: "Imagery" },
    { value: "TERRAIN", label: "Terrain" },
    { value: "3DTILES", label: "3D Tiles" },
    { value: "GLTF", label: "glTF Model" },
    { value: "CZML", label: "CZML" },
    { value: "KML", label: "KML" },
    { value: "GEOJSON", label: "GeoJSON" },
  ];
  const [selectedAsset, setSelectedAsset] = useState<LibraryAsset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedMetadata, setEditedMetadata] = useState<MetadataRow[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [uploadToIonDrawerOpen, setUploadToIonDrawerOpen] = useState(false);
  const [addIonAssetDrawerOpen, setAddIonAssetDrawerOpen] = useState(false);
  const [retakePhotoOpen, setRetakePhotoOpen] = useState(false);
  const [adjustLocationOpen, setAdjustLocationOpen] = useState(false);

  // Access scene store to update assets when transform changes
  const cesiumIonAssets = useSceneStore((state) => state.cesiumIonAssets);
  const updateCesiumIonAsset = useSceneStore((state) => state.updateCesiumIonAsset);

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


  // Filter assets based on search query and type
  const filteredAssets = assets.filter((asset) => {
    const name = asset.name || asset.originalFilename || "";
    const description = asset.description || "";
    const query = searchQuery.toLowerCase();

    // Filter by search query
    const matchesSearch =
      name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query);

    // Filter by type
    const matchesType = !selectedType || asset.fileType === selectedType;

    return matchesSearch && matchesType;
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

  const handleRetryTiling = async () => {
    if (!selectedAsset) return;

    try {
      // Reset tiling status from ERROR to IN_PROGRESS
      await updateModelMetadata(selectedAsset.id, {
        metadata: {
          ...(selectedAsset.metadata as Record<string, any>),
          tilingStatus: "IN_PROGRESS",
          error: undefined, // Clear error message
        },
      });

      // Refresh assets to show updated status
      mutate();

      showToast("Retrying tiling status check...");
    } catch (error) {
      console.error("Failed to retry tiling:", error);
      showToast("Failed to retry tiling status check");
    }
  };

  // Handle adjust tileset location
  const handleAdjustLocation = () => {
    setAdjustLocationOpen(true);
  };

  const handleSaveLocation = async (
    transform: number[],
    longitude: number,
    latitude: number,
    height: number
  ) => {
    if (!selectedAsset) return;

    try {
      // Update transform both in our database and on Cesium Ion
      const result = await updateModelTransform(selectedAsset.id, {
        transform,
        longitude,
        latitude,
        height,
      });

      // Update scene store if this asset is already loaded in the builder
      if (selectedAsset.cesiumAssetId) {
        const transformData = {
          matrix: transform,
          longitude,
          latitude,
          height,
        };

        // Find assets in scene store that match this Cesium Ion asset ID
        cesiumIonAssets.forEach((asset) => {
          if (asset.assetId === selectedAsset.cesiumAssetId) {
            console.log("[Library] Updating scene store asset with new transform:", {
              sceneStoreAssetId: asset.id,
              cesiumAssetId: asset.assetId,
              transform: transformData,
            });
            updateCesiumIonAsset(asset.id, { transform: transformData });
          }
        });
      }

      if (result.warning) {
        showToast(
          `Location saved locally. ${result.warning}`,
          "warning"
        );
      } else {
        showToast("Tileset location updated successfully", "success");
      }

      // Update selectedAsset with the new data from API
      // Cast to LibraryAsset since we know the asset has required fields
      setSelectedAsset(result.asset as LibraryAsset);

      mutate(); // Refresh assets list
    } catch (error) {
      console.error("Error saving location:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while saving location",
        "error"
      );
      throw error; // Re-throw so dialog can handle it
    }
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
              <Select
                id="asset-type-filter"
                name="asset-type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                displayEmpty
                size="small"
                sx={(theme) => ({
                  minWidth: 150,
                  ...((typeof selectStyles === "function"
                    ? selectStyles(theme)
                    : selectStyles) as Record<string, unknown>),
                  "& .MuiSelect-select": {
                    color: selectedType
                      ? undefined
                      : theme.palette.text.secondary,
                  },
                })}
                renderValue={(selected) => {
                  if (!selected) {
                    return "Type";
                  }
                  const selectedTypeObj = cesiumAssetTypes.find(
                    (t) => t.value === selected
                  );
                  return selectedTypeObj?.label || selected;
                }}
              >
                <MenuItem value="" sx={menuItemStyles}>
                  Type
                </MenuItem>
                {cesiumAssetTypes.map((type) => (
                  <MenuItem
                    key={type.value}
                    value={type.value}
                    sx={menuItemStyles}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
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
                    onRetryTiling={handleRetryTiling}
                    onAdjustLocation={handleAdjustLocation}
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
            assetType={selectedAsset.fileType}
            onCapture={handleCaptureScreenshot}
          />
        )}

      {/* Adjust Tileset Location Dialog */}
      {selectedAsset &&
        selectedAsset.cesiumAssetId &&
        selectedAsset.cesiumApiKey && (
          <AdjustTilesetLocationDialog
            open={adjustLocationOpen}
            onClose={() => setAdjustLocationOpen(false)}
            cesiumAssetId={selectedAsset.cesiumAssetId}
            cesiumApiKey={selectedAsset.cesiumApiKey}
            assetName={
              selectedAsset.name || selectedAsset.originalFilename || "Asset"
            }
            assetType={selectedAsset.fileType}
            initialTransform={(() => {
              const metadata = selectedAsset.metadata;
              if (
                metadata &&
                typeof metadata === "object" &&
                "transform" in metadata &&
                metadata.transform !== null &&
                metadata.transform !== undefined
              ) {
                const transform = metadata.transform as { matrix?: unknown };
                if (
                  typeof transform === "object" &&
                  transform !== null &&
                  "matrix" in transform &&
                  Array.isArray(transform.matrix)
                ) {
                  const matrix = transform.matrix as number[];
                  console.log("[Library] 🔵 PASSING initialTransform to dialog:", {
                    matrixLength: matrix.length,
                    matrixString: matrix.join(','),
                    matrix: matrix,
                    transform: transform,
                  });
                  return matrix;
                }
              }
              console.log("[Library] ⚠️ No initialTransform found in metadata:", {
                hasMetadata: !!metadata,
                metadata: metadata,
              });
              return undefined;
            })()}
            onSave={handleSaveLocation}
          />
        )}
    </>
  );
};

export default LibraryGeospatialPage;
