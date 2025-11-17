"use client";

import React from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UploadToIonTab } from "@envisio/ui";
import { showToast } from "@envisio/ui";
import { useCesiumIonUpload } from "@envisio/engine-cesium";
import { createIonAsset, completeIonUpload, createCesiumIonAsset, updateModelMetadata } from "@/app/utils/api";

interface UploadToIonDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadToIonDrawer: React.FC<UploadToIonDrawerProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const {
    ionUploading,
    ionUploadProgress,
    setIonUploading,
    setIonUploadProgress,
    pollAssetStatus,
    mapSourceType,
    uploadToS3,
  } = useCesiumIonUpload();

  const handleUpload = async (data: {
    file: File;
    name: string;
    description: string;
    sourceType: string;
    accessToken: string;
    longitude?: number;
    latitude?: number;
    height?: number;
    options?: {
      dracoCompression?: boolean;
      ktx2Compression?: boolean;
      webpImages?: boolean;
      geometricCompression?: string;
      epsgCode?: string;
      makeDownloadable?: boolean;
      tilesetJson?: string;
    };
  }): Promise<{ assetId: string }> => {
    setIonUploading(true);
    setIonUploadProgress(0);

    try {
      const {
        file,
        name,
        description,
        sourceType,
        accessToken,
        longitude,
        latitude,
        height,
        options,
      } = data;

      // Step 1: Create asset on Cesium Ion via app API
      setIonUploadProgress(10);

      const { ionType, uploadSourceType } = mapSourceType(sourceType);

      // Build Ion-compatible options
      const ionOptions: Record<string, unknown> = {};

      if (sourceType === "3DTILES_ARCHIVE") {
        ionOptions.sourceType = "3DTILES";
        ionOptions.tilesetJson = options?.tilesetJson || "tileset.json";
      } else if (uploadSourceType) {
        ionOptions.sourceType = uploadSourceType;
      }

      // position: object shape { longitude, latitude, height }
      if (longitude !== undefined && latitude !== undefined) {
        ionOptions.position = {
          longitude,
          latitude,
          height: height || 0,
        };
      }

      // inputCrs: "EPSG:xxxx" format for IFC without embedded CRS
      if (options?.epsgCode) {
        ionOptions.inputCrs = `EPSG:${options.epsgCode}`;
      }

      // geometryCompression: "MESHOPT" or "DRACO" for BIM/CAD
      if (options?.geometricCompression) {
        const compression = options.geometricCompression.toUpperCase();
        if (compression === "MESHOPT" || compression === "DRACO") {
          ionOptions.geometryCompression = compression;
        }
      }

      // textureFormat: "KTX2" for BIM/CAD uploads
      if (uploadSourceType === "BIM_CAD" && options?.ktx2Compression) {
        ionOptions.textureFormat = "KTX2";
      }

      // Point Cloud options: dracoCompression and gaussianSplats
      if (uploadSourceType === "POINT_CLOUD") {
        if (options?.dracoCompression !== undefined) {
          ionOptions.dracoCompression = options.dracoCompression;
        }
        if (options?.gaussianSplats !== undefined) {
          ionOptions.gaussianSplats = options.gaussianSplats;
        }
      }

      const createAssetResponse = await createIonAsset({
        name,
        description,
        type: ionType,
        accessToken,
        options: ionOptions,
      });

      const { assetId, assetMetadata, uploadLocation, onComplete } = createAssetResponse;

      // Prefer assetMetadata.id over assetId or regex parsing
      const inferredId =
        (assetMetadata as { id?: number })?.id ??
        assetId ??
        (() => {
          const match = /sources\/(\d+)\//.exec((uploadLocation as { prefix?: string })?.prefix || "");
          return match ? Number(match[1]) : undefined;
        })();

      if (!inferredId) {
        throw new Error(
          "Ion response missing assetMetadata.id, assetId, and prefix; cannot proceed."
        );
      }

      setIonUploadProgress(20);

      // Step 2: Upload file to S3
      await uploadToS3(file, uploadLocation, setIonUploadProgress);

      // Step 3: Notify Cesium Ion that upload is complete
      await completeIonUpload({ onComplete, accessToken });

      setIonUploadProgress(100);

      showToast(`Successfully uploaded to Cesium Ion! Asset ID: ${inferredId}`);

      // Save to database immediately with IN_PROGRESS status
      // This allows the asset to appear in the library right away
      const { asset: newAsset } = await createCesiumIonAsset({
        assetType: "cesiumIonAsset",
        cesiumAssetId: String(inferredId),
        cesiumApiKey: accessToken,
        name: name || `Ion Asset ${inferredId}`,
        description: description || "",
        metadata: {
          ionAssetId: String(inferredId),
          tilingStatus: "IN_PROGRESS",
          tilingProgress: 0,
        },
      });

      showToast("Ion asset added to your library! Tiling in progress...");
      onSuccess();

      // Start background polling to update tiling status
      // Don't await - let it run in the background
      // Pass file size to calculate appropriate timeout (larger files take longer to tile)
      pollAssetStatus(Number(inferredId), accessToken, (_status, _percent) => {
        // Tiling progress update - could update asset metadata here if needed
      }, file.size)
        .then(async (assetInfo) => {
          // Update asset metadata when tiling completes
          try {
            await updateModelMetadata(newAsset.id, {
              metadata: {
                ionAssetId: String(inferredId),
                tilingStatus: "COMPLETE",
                tilingProgress: 100,
                type: assetInfo.type,
                status: assetInfo.status,
                bytes: assetInfo.bytes,
              },
            });
          } catch (err) {
            console.error("Failed to update tiling status:", err);
          }
        })
        .catch(async (err) => {
          console.error("Polling error:", err);
          // Update status to ERROR
          try {
            await updateModelMetadata(newAsset.id, {
              metadata: {
                ionAssetId: String(inferredId),
                tilingStatus: "ERROR",
                error: err.message,
              },
            });
          } catch (updateErr) {
            console.error("Failed to update error status:", updateErr);
          }
        });

      return { assetId: String(inferredId) };
    } catch (error) {
      console.error("Ion upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Cesium Ion upload failed: ${errorMessage}`);
      throw error;
    } finally {
      setIonUploading(false);
      setIonUploadProgress(0);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500,
        "& .MuiBackdrop-root": {
          zIndex: 1499,
        },
      }}
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true,
      }}
      PaperProps={{
        sx: (theme) => ({
          width: { xs: "100%", sm: "700px" },
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A !important"
              : theme.palette.background.paper,
          borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
          zIndex: 1500,
          "&.MuiPaper-root": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        }),
      }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A"
              : theme.palette.background.paper,
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Upload to Cesium Ion
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={ionUploading}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
          }}
        >
          <UploadToIonTab
            onUpload={handleUpload}
            uploading={ionUploading}
            uploadProgress={ionUploadProgress}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

