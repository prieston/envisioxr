"use client";

import React, { useState, useCallback } from "react";
import { Box, Button, LinearProgress, IconButton, Paper, Typography, Switch, FormControlLabel } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Close, Public } from "@mui/icons-material";
import { SuccessView } from "./upload-ion/SuccessView";
import { FileDropZone } from "./upload-ion/FileDropZone";
import { BasicInfoForm } from "./upload-ion/BasicInfoForm";
import { AdvancedOptions } from "./upload-ion/AdvancedOptions";
import { GeoreferencingForm } from "./upload-ion/GeoreferencingForm";

export interface UploadToIonTabProps {
  onUpload: (data: {
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
  }) => Promise<{ assetId: string }>;
  uploading?: boolean;
  uploadProgress?: number;
}

const UploadToIonTab: React.FC<UploadToIonTabProps> = ({
  onUpload,
  uploading = false,
  uploadProgress = 0,
}) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const accentActive = theme.palette.primary.dark;
  const accentSoft = alpha(accent, 0.08);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("3DTILES");
  const [accessToken, setAccessToken] = useState("");
  const [longitude, setLongitude] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [height, setHeight] = useState<string>("0");
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [dracoCompression, setDracoCompression] = useState(true);
  const [ktx2Compression, setKtx2Compression] = useState(true);
  const [webpImages, setWebpImages] = useState(false);
  const [geometricCompression, setGeometricCompression] = useState("Draco");
  const [epsgCode, setEpsgCode] = useState("");
  const [makeDownloadable, setMakeDownloadable] = useState(false);
  const [tilesetJson, setTilesetJson] = useState("tileset.json");

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setName(file.name.replace(/\.[^/.]+$/, ""));
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setName("");
    setDescription("");
    setSourceType("3DTILES");
    setAccessToken("");
    setLongitude("");
    setLatitude("");
    setHeight("0");
    setUploadedAssetId(null);
    setDracoCompression(true);
    setKtx2Compression(true);
    setWebpImages(false);
    setGeometricCompression("Draco");
    setEpsgCode("");
    setMakeDownloadable(false);
    setTilesetJson("tileset.json");
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !name || !accessToken) return;

    try {
      const uploadOptions: any = {};

      if (sourceType === "3DTILES_ARCHIVE") {
        uploadOptions.tilesetJson = tilesetJson || "tileset.json";
      } else {
        if (dracoCompression !== undefined)
          uploadOptions.dracoCompression = dracoCompression;
        if (ktx2Compression !== undefined)
          uploadOptions.ktx2Compression = ktx2Compression;
        if (webpImages !== undefined) uploadOptions.webpImages = webpImages;
        if (geometricCompression)
          uploadOptions.geometricCompression = geometricCompression;
        if (epsgCode) uploadOptions.epsgCode = epsgCode;
      }

      if (makeDownloadable) uploadOptions.makeDownloadable = makeDownloadable;

      const result = await onUpload({
        file: selectedFile,
        name,
        description,
        sourceType,
        accessToken,
        longitude: longitude ? parseFloat(longitude) : undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        height: height ? parseFloat(height) : undefined,
        options: uploadOptions,
      });

      setUploadedAssetId(result.assetId);
    } catch (error) {
      console.error("Upload to Ion failed:", error);
    }
  }, [
    selectedFile,
    name,
    description,
    sourceType,
    accessToken,
    longitude,
    latitude,
    height,
    dracoCompression,
    ktx2Compression,
    webpImages,
    geometricCompression,
    epsgCode,
    makeDownloadable,
    tilesetJson,
    onUpload,
  ]);

  if (uploadedAssetId) {
    return <SuccessView assetId={uploadedAssetId} onReset={handleCancel} />;
  }

  if (!selectedFile) {
    return <FileDropZone onFileSelected={handleFileSelected} />;
  }

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
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
      {/* File Info */}
      <Paper
        sx={(theme) => ({
          p: 2,
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.875rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
            })}
          >
            {selectedFile.name}
          </Typography>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
            })}
          >
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
        </Box>
        <IconButton
          onClick={handleCancel}
          size="small"
          disabled={uploading}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            "&:hover": {
              color: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
          })}
        >
          <Close />
        </IconButton>
      </Paper>

      {/* Basic Info Form */}
      <BasicInfoForm
        name={name}
        description={description}
        accessToken={accessToken}
        sourceType={sourceType}
        tilesetJson={tilesetJson}
        uploading={uploading}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onAccessTokenChange={setAccessToken}
        onSourceTypeChange={setSourceType}
        onTilesetJsonChange={setTilesetJson}
      />

      {/* Advanced Options */}
      <AdvancedOptions
        sourceType={sourceType}
        dracoCompression={dracoCompression}
        ktx2Compression={ktx2Compression}
        webpImages={webpImages}
        geometricCompression={geometricCompression}
        epsgCode={epsgCode}
        uploading={uploading}
        onDracoCompressionChange={setDracoCompression}
        onKtx2CompressionChange={setKtx2Compression}
        onWebpImagesChange={setWebpImages}
        onGeometricCompressionChange={setGeometricCompression}
        onEpsgCodeChange={setEpsgCode}
      />

      {/* Make available for download */}
      <FormControlLabel
        control={
          <Switch
            checked={makeDownloadable}
            onChange={(e) => setMakeDownloadable(e.target.checked)}
            disabled={uploading}
          />
        }
        label={
          <Typography sx={{ fontSize: "0.875rem" }}>
            Make available for download
          </Typography>
        }
      />

      {/* Georeferencing */}
      <GeoreferencingForm
        longitude={longitude}
        latitude={latitude}
        height={height}
        uploading={uploading}
        onLongitudeChange={setLongitude}
        onLatitudeChange={setLatitude}
        onHeightChange={setHeight}
      />

      {/* Upload Progress */}
      {uploading && (
        <Box>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{
              height: "8px",
              borderRadius: "4px",
              backgroundColor: accentSoft,
              "& .MuiLinearProgress-bar": {
                borderRadius: "4px",
                backgroundColor: accentActive,
              },
            }}
          />
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
              mt: 0.5,
              textAlign: "center",
            })}
          >
            Uploading to Cesium Ion... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }}>
        <Button
          onClick={handleCancel}
          disabled={uploading}
          sx={(theme) => ({
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(100, 116, 139, 0.12)"
                  : "rgba(100, 116, 139, 0.08)",
              boxShadow: "none",
            },
          })}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!name || !accessToken || uploading}
          startIcon={<Public />}
          sx={(theme) => ({
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            backgroundColor: theme.palette.primary.main,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: "none",
            },
          })}
        >
          Upload to Ion
        </Button>
      </Box>
    </Box>
  );
};

export default UploadToIonTab;
