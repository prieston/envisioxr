import React from "react";
import { Box, Typography, Button, IconButton, TextField, LinearProgress, Alert } from "@mui/material";
import { Delete, Edit, Save, Close, AddCircleOutline, CameraAlt, Refresh, LocationOn } from "@mui/icons-material";
import { MetadataTable, type MetadataRow } from "../../../table";
import type { LibraryAsset } from "../MyLibraryTab";
import { textFieldStyles } from "../../../../styles/inputStyles";

interface AssetDetailViewProps {
  asset: LibraryAsset;
  isEditing: boolean;
  editedName: string;
  editedDescription: string;
  editedMetadata: MetadataRow[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMetadataChange: (value: MetadataRow[]) => void;
  onEditClick: () => void;
  onCancelEdit: () => void;
  onSaveChanges: () => void;
  onDeleteClick: () => void;
  onAddToScene: () => void;
  onRetakePhoto: () => void;
  onRetryTiling?: () => void;
  onAdjustLocation?: () => void; // Callback for adjusting tileset location
  canUpdate?: boolean;
  showAddToScene?: boolean;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  isEditing,
  editedName,
  editedDescription,
  editedMetadata,
  onNameChange,
  onDescriptionChange,
  onMetadataChange,
  onEditClick,
  onCancelEdit,
  onSaveChanges,
  onDeleteClick,
  onAddToScene,
  onRetakePhoto,
  onRetryTiling,
  onAdjustLocation,
  canUpdate = true,
  showAddToScene = true,
}) => {
  // Check tiling status for Cesium Ion assets
  const metadata = asset.metadata as Record<string, any> | undefined;
  const tilingStatus = metadata?.tilingStatus as string | undefined;
  const cesiumStatus = metadata?.status as string | undefined; // Status from Cesium Ion API (for synced assets)
  const tilingProgress = metadata?.tilingProgress as number | undefined;
  const isCesiumIonAsset = asset.assetType === "cesiumIonAsset" || !!asset.cesiumAssetId;

  // Check if tiling is complete:
  // 1. If tilingStatus is explicitly "COMPLETE" (for newly uploaded assets)
  // 2. If tilingStatus is undefined but cesiumStatus is "COMPLETE" or "ACTIVE" (for synced assets)
  //    Synced assets from Cesium Ion integrations don't have tilingStatus but have status from API
  const isTilingComplete =
    tilingStatus === "COMPLETE" ||
    (tilingStatus === undefined && (cesiumStatus === "COMPLETE" || cesiumStatus === "ACTIVE"));

  const isTilingInProgress = tilingStatus === "IN_PROGRESS";
  const isTilingError = tilingStatus === "ERROR";

  return (
    <>
      <Box
        sx={(theme) => ({
          flex: 1,
          overflowY: "auto",
          padding: 2,
          paddingRight: 1,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background:
              theme.palette.mode === "dark"
                ? "rgba(107, 156, 216, 0.08)"
                : "rgba(95, 136, 199, 0.05)",
            borderRadius: "4px",
            margin: "4px 0",
          },
          "&::-webkit-scrollbar-thumb": {
            background:
              theme.palette.mode === "dark"
                ? "rgba(107, 156, 216, 0.24)"
                : "rgba(95, 136, 199, 0.2)",
            borderRadius: "4px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
            transition: "background 0.2s ease",
            "&:hover": {
              background:
                theme.palette.mode === "dark"
                  ? "rgba(107, 156, 216, 0.38)"
                  : "rgba(95, 136, 199, 0.35)",
              backgroundClip: "padding-box",
            },
          },
        })}
      >
        {/* Asset Info */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Thumbnail */}
          <Box
            sx={(theme) => ({
              width: "120px",
              height: "120px",
              flexShrink: 0,
              borderRadius: "4px",
              overflow: "hidden",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(226, 232, 240, 0.05)"
                  : "rgba(226, 232, 240, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: canUpdate ? "pointer" : "default",
              "&:hover .retake-overlay": {
                opacity: canUpdate ? 1 : 0,
              },
            })}
          >
            {asset.thumbnail || asset.thumbnailUrl ? (
              <img
                src={asset.thumbnail || asset.thumbnailUrl}
                alt={asset.name || asset.originalFilename}
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
            {canUpdate && (
              <Box
                className="retake-overlay"
                onClick={onRetakePhoto}
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
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  })}
                >
                  Name
                </Typography>
                <TextField
                  id="asset-detail-name"
                  name="asset-detail-name"
                  value={editedName}
                  onChange={(e) => onNameChange(e.target.value)}
                  size="small"
                  fullWidth
                  sx={textFieldStyles}
                />
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                    mt: 1.5,
                  })}
                >
                  Description
                </Typography>
                <TextField
                  id="asset-detail-description"
                  name="asset-detail-description"
                  value={editedDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a description..."
                  sx={textFieldStyles}
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
                  {asset.name || asset.originalFilename}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.813rem",
                    color: asset.description
                      ? "rgba(100, 116, 139, 0.9)"
                      : "rgba(100, 116, 139, 0.5)",
                    mb: 0.5,
                    lineHeight: 1.4,
                    fontStyle: asset.description ? "normal" : "italic",
                  }}
                >
                  {asset.description || "No description"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    color: "rgba(100, 116, 139, 0.8)",
                  }}
                >
                  {asset.fileType}
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
            onChange={onMetadataChange}
          />
        </Box>
      </Box>

      {/* Tiling Status Banner */}
      {isCesiumIonAsset && isTilingInProgress && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert severity="info" sx={{ fontSize: "0.75rem", py: 0.5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="caption">
                Tiling in progress... This may take a few minutes.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={tilingProgress || 0}
                sx={{ height: 6, borderRadius: 1 }}
              />
              <Typography variant="caption" sx={{ textAlign: "right" }}>
                {tilingProgress || 0}%
              </Typography>
            </Box>
          </Alert>
        </Box>
      )}

      {isCesiumIonAsset && isTilingError && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert
            severity="error"
            sx={{ fontSize: "0.75rem" }}
            action={
              onRetryTiling ? (
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={onRetryTiling}
                  sx={{
                    fontSize: "0.7rem",
                    textTransform: "none",
                    minWidth: "auto",
                    padding: "2px 8px",
                  }}
                >
                  Retry
                </Button>
              ) : undefined
            }
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="caption">
                Tiling failed. {onRetryTiling ? "Click Retry to check status again." : "Please try uploading again."}
              </Typography>
            </Box>
          </Alert>
        </Box>
      )}

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
        {showAddToScene && (
          <Button
            variant="outlined"
            startIcon={<AddCircleOutline />}
            onClick={onAddToScene}
            disabled={Boolean(isCesiumIonAsset && !isTilingComplete)}
            sx={(theme) => ({
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(107, 156, 216, 0.35)"
                  : "rgba(95, 136, 199, 0.4)",
              color: theme.palette.primary.main,
              padding: "6px 16px",
              boxShadow: "none",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(107, 156, 216, 0.12)"
                    : "rgba(95, 136, 199, 0.08)",
                boxShadow: "none",
              },
              "&:disabled": {
                borderColor: "rgba(100, 116, 139, 0.2)",
                color: "rgba(100, 116, 139, 0.5)",
              },
            })}
          >
            {isCesiumIonAsset && !isTilingComplete
              ? "Tiling in progress..."
              : "Add to Scene"}
          </Button>
        )}

        {/* Adjust Tileset Location button - only for Cesium Ion 3D Tiles assets */}
        {isCesiumIonAsset &&
          (asset.fileType === "cesium-ion-tileset" ||
            asset.fileType === "3DTILES" ||
            asset.fileType?.includes("3DTILES")) &&
          onAdjustLocation && (
            <Button
              variant="outlined"
              startIcon={<LocationOn />}
              onClick={onAdjustLocation}
              disabled={!isTilingComplete}
              sx={(theme) => ({
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(107, 156, 216, 0.35)"
                    : "rgba(95, 136, 199, 0.4)",
                color: theme.palette.primary.main,
                padding: "6px 16px",
                boxShadow: "none",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(107, 156, 216, 0.12)"
                      : "rgba(95, 136, 199, 0.08)",
                  boxShadow: "none",
                },
                "&:disabled": {
                  borderColor: "rgba(100, 116, 139, 0.2)",
                  color: "rgba(100, 116, 139, 0.5)",
                },
              })}
            >
              Adjust Tileset Location
            </Button>
          )}

        <Box sx={{ flex: 1 }} />

        {!isEditing ? (
          <IconButton
            onClick={onEditClick}
            size="small"
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "4px",
              padding: "6px",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(107, 156, 216, 0.12)"
                    : "rgba(95, 136, 199, 0.08)",
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              },
            })}
          >
            <Edit fontSize="small" />
          </IconButton>
        ) : (
          <>
            <IconButton
              onClick={onSaveChanges}
              size="small"
              sx={(theme) => ({
                color: theme.palette.primary.main,
                border: `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(107, 156, 216, 0.35)"
                    : "rgba(95, 136, 199, 0.4)"
                }`,
                borderRadius: "4px",
                padding: "6px",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(107, 156, 216, 0.14)"
                      : "rgba(95, 136, 199, 0.1)",
                  borderColor: theme.palette.primary.main,
                },
              })}
            >
              <Save fontSize="small" />
            </IconButton>
            <IconButton
              onClick={onCancelEdit}
              size="small"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "4px",
                padding: "6px",
                "&:hover": {
                  backgroundColor: "rgba(100, 116, 139, 0.1)",
                  borderColor: theme.palette.text.secondary,
                },
              })}
            >
              <Close fontSize="small" />
            </IconButton>
          </>
        )}
        <IconButton
          onClick={onDeleteClick}
          size="small"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "4px",
            padding: "6px",
            "&:hover": {
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "#ef4444",
              color: "#ef4444",
            },
          })}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </>
  );
};

