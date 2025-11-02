"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  Alert,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  CloudUpload,
  Close,
  Public,
  ExpandMore,
  Settings,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { textFieldStyles, selectStyles } from "../../../styles/inputStyles";

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
  const accentBorder = alpha(accent, 0.4);
  const accentSoft = alpha(accent, 0.08);
  const accentSubtle = alpha(accent, 0.05);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("3DTILES");
  const [accessToken, setAccessToken] = useState("");
  const [longitude, setLongitude] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [height, setHeight] = useState<string>("0");
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);

  // Advanced options
  const [dracoCompression, setDracoCompression] = useState(true);
  const [ktx2Compression, setKtx2Compression] = useState(true);
  const [webpImages, setWebpImages] = useState(false);
  const [geometricCompression, setGeometricCompression] = useState("Draco");
  const [epsgCode, setEpsgCode] = useState("");
  const [makeDownloadable, setMakeDownloadable] = useState(false);
  const [tilesetJson, setTilesetJson] = useState("tileset.json");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "application/zip": [".zip"],
      "application/x-step": [".ifc"],
      "application/ifc": [".ifc"],
    },
    multiple: false,
  });

  const handleCancel = () => {
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
  };

  const handleUpload = async () => {
    if (!selectedFile || !name || !accessToken) return;

    try {
      // Build options based on source type
      const uploadOptions: any = {};

      if (sourceType === "3DTILES_ARCHIVE") {
        // For existing 3D Tiles archives, only include tilesetJson reference
        uploadOptions.tilesetJson = tilesetJson || "tileset.json";
      } else {
        // For other types, include compression and processing options
        if (dracoCompression !== undefined)
          uploadOptions.dracoCompression = dracoCompression;
        if (ktx2Compression !== undefined)
          uploadOptions.ktx2Compression = ktx2Compression;
        if (webpImages !== undefined) uploadOptions.webpImages = webpImages;
        if (geometricCompression)
          uploadOptions.geometricCompression = geometricCompression;
        if (epsgCode) uploadOptions.epsgCode = epsgCode;
      }

      // Common options for all types
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
  };

  if (uploadedAssetId) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Public sx={{ fontSize: "2.5rem", color: "#22c55e" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
          }}
        >
          Successfully uploaded to Cesium Ion!
        </Typography>
        <Paper
          sx={(theme) => ({
            p: 2,
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.8)",
              mb: 0.5,
            }}
          >
            Asset ID:
          </Typography>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: accent,
              fontFamily: "monospace",
            }}
          >
            {uploadedAssetId}
          </Typography>
        </Paper>
        <Alert severity="info" sx={{ width: "100%", maxWidth: "500px" }}>
          Your model is now being processed by Cesium Ion. This may take a few
          minutes. You can add this asset using the "Cesium Ion Asset" tab.
        </Alert>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            borderColor: accentBorder,
            color: accent,
            "&:hover": {
              borderColor: accent,
              backgroundColor: accentSoft,
            },
          }}
        >
          Upload Another Model
        </Button>
      </Box>
    );
  }

  if (!selectedFile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert severity="info" icon={<Public />}>
          Upload your georeferenced 3D model to your Cesium Ion account for
          tiling and optimization. You'll need a Cesium Ion access token with{" "}
          <strong>assets:write</strong> permission.
        </Alert>
        <Box
          {...getRootProps()}
          sx={(theme) => ({
            border: "2px dashed",
            borderColor: isDragActive ? accent : "rgba(255, 255, 255, 0.08)",
            borderRadius: "4px",
            padding: "60px 24px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragActive
              ? accentSubtle
              : theme.palette.background.default,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: accent,
              backgroundColor: accentSubtle,
            },
          })}
        >
          <input {...getInputProps()} />
          <CloudUpload
            sx={{
              fontSize: "4rem",
              color: isDragActive ? accent : "rgba(100, 116, 139, 0.4)",
              mb: 2,
            }}
          />
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "rgba(51, 65, 85, 0.95)",
              mb: 1,
            }}
          >
            {isDragActive
              ? "Drop your model here"
              : "Drag & drop your model here"}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.8)",
              mb: 2,
            }}
          >
            or click to browse
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(100, 116, 139, 0.6)",
            }}
          >
            Supported formats: GLB, GLTF, IFC, ZIP (with textures)
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

      {/* Asset Details */}
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          Asset Name *
        </Typography>
        <TextField
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={uploading}
          size="small"
          placeholder="Enter asset name"
          sx={textFieldStyles}
        />
      </Box>

      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          Description
        </Typography>
        <TextField
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          size="small"
          multiline
          rows={3}
          placeholder="Add a description..."
          sx={textFieldStyles}
        />
      </Box>

      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          Cesium Ion Access Token *
        </Typography>
        <TextField
          fullWidth
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          disabled={uploading}
          size="small"
          type="password"
          placeholder="Enter your Cesium Ion access token"
          sx={textFieldStyles}
        />
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            mt: 0.5,
          })}
        >
          Get your token from https://ion.cesium.com/tokens (requires
          assets:write scope)
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          What kind of data is this?
        </Typography>
        <Select
          fullWidth
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          disabled={uploading}
          size="small"
          sx={selectStyles}
        >
          <MenuItem value="3DTILES_ARCHIVE">
            3D Tiles (existing tileset.json)
          </MenuItem>
          <MenuItem value="3DTILES">3D Model (tile as 3D Tiles)</MenuItem>
          <MenuItem value="GLTF">3D Model (convert to glTF)</MenuItem>
          <MenuItem value="3DTILES_BIM">
            Architecture, Engineering or Construction model (BIM/CAD)
          </MenuItem>
          <MenuItem value="3DTILES_PHOTOGRAMMETRY">
            3D Capture / Reality Model / Photogrammetry
          </MenuItem>
          <MenuItem value="POINTCLOUD">Point Cloud</MenuItem>
          <MenuItem value="IMAGERY">Imagery</MenuItem>
          <MenuItem value="TERRAIN">Terrain</MenuItem>
          <MenuItem value="GEOJSON">GeoJSON</MenuItem>
          <MenuItem value="KML">KML/KMZ</MenuItem>
          <MenuItem value="CZML">CZML</MenuItem>
        </Select>
      </Box>

      {sourceType === "3DTILES_ARCHIVE" && (
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Tileset JSON path
          </Typography>
          <TextField
            fullWidth
            value={tilesetJson}
            onChange={(e) => setTilesetJson(e.target.value)}
            disabled={uploading}
            size="small"
            placeholder="tileset.json"
            sx={textFieldStyles}
          />
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
              mt: 0.5,
            })}
          >
            Relative path to the tileset.json inside the archive
          </Typography>
        </Box>
      )}

      {/* Options based on selected type */}
      {(sourceType === "3DTILES" ||
        sourceType === "GLTF" ||
        sourceType === "3DTILES_BIM" ||
        sourceType === "3DTILES_PHOTOGRAMMETRY" ||
        sourceType === "POINTCLOUD") && (
        <Accordion
          defaultExpanded
          sx={{
            borderRadius: "4px !important",
            "&:before": { display: "none" },
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              borderRadius: "4px",
              "& .MuiAccordionSummary-content": {
                alignItems: "center",
                gap: 1,
              },
            }}
          >
            <Settings sx={{ fontSize: "1.25rem", color: accent }} />
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {sourceType === "3DTILES_BIM"
                ? "BIM/CAD Options"
                : sourceType === "3DTILES_PHOTOGRAMMETRY"
                  ? "3D Capture Options"
                  : sourceType === "GLTF"
                    ? "Model Options"
                    : sourceType === "POINTCLOUD"
                      ? "Point Cloud Options"
                      : "3D Model Options"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Draco Compression */}
            {(sourceType === "3DTILES" ||
              sourceType === "GLTF" ||
              sourceType === "3DTILES_PHOTOGRAMMETRY") && (
              <FormControlLabel
                control={
                  <Switch
                    checked={dracoCompression}
                    onChange={(e) => setDracoCompression(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem" }}>
                    Draco compression
                  </Typography>
                }
              />
            )}

            {/* KTX2 Compression */}
            {(sourceType === "3DTILES_BIM" ||
              sourceType === "3DTILES_PHOTOGRAMMETRY") && (
              <FormControlLabel
                control={
                  <Switch
                    checked={ktx2Compression}
                    onChange={(e) => setKtx2Compression(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem" }}>
                    KTX2 compression
                  </Typography>
                }
              />
            )}

            {/* WebP Images */}
            {sourceType === "3DTILES" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={webpImages}
                    onChange={(e) => setWebpImages(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem" }}>
                    WebP images
                  </Typography>
                }
              />
            )}

            {/* Geometric Compression */}
            {(sourceType === "3DTILES_BIM" ||
              sourceType === "3DTILES_PHOTOGRAMMETRY") && (
              <Box>
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  })}
                >
                  Geometric Compression
                </Typography>
                <Select
                  fullWidth
                  value={geometricCompression}
                  onChange={(e) => setGeometricCompression(e.target.value)}
                  disabled={uploading}
                  size="small"
                  sx={selectStyles}
                >
                  <MenuItem value="Draco">Draco</MenuItem>
                  <MenuItem value="Meshopt">Meshopt</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </Select>
              </Box>
            )}

            {/* EPSG Code */}
            {sourceType === "3DTILES_BIM" && (
              <Box>
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  })}
                >
                  EPSG Code (Optional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={epsgCode}
                  onChange={(e) => setEpsgCode(e.target.value)}
                  disabled={uploading}
                  placeholder="e.g., 4326"
                  sx={textFieldStyles}
                />
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary,
                    mt: 0.5,
                  })}
                >
                  Coordinate reference system code
                </Typography>
              </Box>
            )}

            {/* Info alerts based on type */}
            {sourceType === "3DTILES_BIM" && (
              <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                Ion will tile your BIM/CAD model into a 3D Tiles 1.1 tileset.
                For Cesium clients, we recommend using Cesium for Unreal v2.11.0
                or later, Cesium for Unity v1.14.0 or later, and CesiumJS
                v1.124.0 or later.
              </Alert>
            )}

            {sourceType === "3DTILES_PHOTOGRAMMETRY" && (
              <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                Ion will tile your photogrammetry, scan, or other mesh into a 3D
                Tiles 1.1 tileset. A 3D Tiles 1.1 client is required.
              </Alert>
            )}

            {sourceType === "GLTF" && (
              <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                Ion will convert your model to glTF format for easy integration.
              </Alert>
            )}

            {sourceType === "POINTCLOUD" && (
              <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                Ion will tile your point cloud data into a 3D Tiles tileset for
                efficient streaming.
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>
      )}

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

      {/* Georeferencing (Optional) */}
      <Typography
        sx={(theme) => ({
          fontSize: "0.813rem",
          fontWeight: 600,
          color: theme.palette.text.primary,
          mt: 1,
        })}
      >
        Georeferencing (Optional)
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Longitude
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            disabled={uploading}
            placeholder="0.0"
            inputProps={{ step: "0.000001", min: -180, max: 180 }}
            sx={textFieldStyles}
          />
        </Box>
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Latitude
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            disabled={uploading}
            placeholder="0.0"
            inputProps={{ step: "0.000001", min: -90, max: 90 }}
            sx={textFieldStyles}
          />
        </Box>
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Height (m)
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            disabled={uploading}
            placeholder="0"
            inputProps={{ step: "0.1" }}
            sx={textFieldStyles}
          />
        </Box>
      </Box>

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
