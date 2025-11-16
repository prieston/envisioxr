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

      const createAssetResponse = await fetch("/api/ion-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          type: ionType,
          accessToken,
          options: ionOptions,
        }),
      });

      if (!createAssetResponse.ok) {
        const errorData = await createAssetResponse.json();
        let errorMessage =
          errorData.error || "Failed to create asset on Cesium Ion";
        if (errorData.details) {
          try {
            const details =
              typeof errorData.details === "string"
                ? JSON.parse(errorData.details)
                : errorData.details;
            if (details.message) {
              errorMessage = details.message;
            }
          } catch (e) {
            errorMessage = errorData.details;
          }
        }
        throw new Error(errorMessage);
      }

      const { assetId, assetMetadata, uploadLocation, onComplete } =
        await createAssetResponse.json();

      // Prefer assetMetadata.id over assetId or regex parsing
      const inferredId =
        assetMetadata?.id ??
        assetId ??
        (() => {
          const match = /sources\/(\d+)\//.exec(uploadLocation?.prefix || "");
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
      const completeResponse = await fetch("/api/ion-upload", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onComplete, accessToken }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || "Failed to complete upload");
      }

      setIonUploadProgress(100);

      showToast(`Successfully uploaded to Cesium Ion! Asset ID: ${inferredId}`);

      // Poll for tiling status and save to library when complete
      pollAssetStatus(inferredId, accessToken, (_status, _percent) => {
        // Tiling progress update
      })
        .then(async (assetInfo) => {
          // Save to database
          const response = await fetch("/api/models", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: assetInfo.name || `Ion Asset ${inferredId}`,
              originalFilename: assetInfo.name,
              description: assetInfo.description || "",
              fileType: "cesium-ion",
              assetType: "cesiumIonAsset",
              cesiumAssetId: String(inferredId),
              cesiumApiKey: accessToken,
              metadata: {
                ionAssetId: String(inferredId),
                type: assetInfo.type,
                status: assetInfo.status,
                bytes: assetInfo.bytes,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save: ${response.status}`);
          }

          showToast("Ion asset added to your library!");
          onSuccess();
        })
        .catch((err) => {
          console.error("Polling or saving error:", err);
          showToast(`Tiling status check failed: ${err.message}`);
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

