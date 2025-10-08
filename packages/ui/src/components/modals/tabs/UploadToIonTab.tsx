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
  FormControl,
  InputLabel,
} from "@mui/material";
import { CloudUpload, Close, Public } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";

export interface UploadToIonTabProps {
  onUpload: (data: {
    file: File;
    name: string;
    description: string;
    sourceType: string;
    longitude?: number;
    latitude?: number;
    height?: number;
  }) => Promise<{ assetId: string }>;
  uploading?: boolean;
  uploadProgress?: number;
}

const UploadToIonTab: React.FC<UploadToIonTabProps> = ({
  onUpload,
  uploading = false,
  uploadProgress = 0,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("3D_MODEL");
  const [longitude, setLongitude] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [height, setHeight] = useState<string>("0");
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);

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
    },
    multiple: false,
  });

  const handleCancel = () => {
    setSelectedFile(null);
    setName("");
    setDescription("");
    setSourceType("3D_MODEL");
    setLongitude("");
    setLatitude("");
    setHeight("0");
    setUploadedAssetId(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !name) return;

    try {
      const result = await onUpload({
        file: selectedFile,
        name,
        description,
        sourceType,
        longitude: longitude ? parseFloat(longitude) : undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        height: height ? parseFloat(height) : undefined,
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
          sx={{
            p: 2,
            borderRadius: "12px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            backgroundColor: "rgba(248, 250, 252, 0.6)",
          }}
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
              color: "#2563eb",
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
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            borderColor: "rgba(37, 99, 235, 0.3)",
            color: "#2563eb",
            "&:hover": {
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
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
          Upload your georeferenced 3D model to Cesium Ion for tiling and
          optimization. This is ideal for large models that need to be streamed
          efficiently.
        </Alert>
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed",
            borderColor: isDragActive ? "#2563eb" : "rgba(226, 232, 240, 0.8)",
            borderRadius: "12px",
            padding: "60px 24px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: isDragActive
              ? "rgba(37, 99, 235, 0.05)"
              : "rgba(248, 250, 252, 0.6)",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.05)",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload
            sx={{
              fontSize: "4rem",
              color: isDragActive ? "#2563eb" : "rgba(100, 116, 139, 0.4)",
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
            Supported formats: GLB, GLTF, ZIP (with textures)
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* File Info */}
      <Paper
        sx={{
          p: 2,
          borderRadius: "12px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          backgroundColor: "rgba(248, 250, 252, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "rgba(51, 65, 85, 0.95)",
            }}
          >
            {selectedFile.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(100, 116, 139, 0.8)",
            }}
          >
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
        </Box>
        <IconButton
          onClick={handleCancel}
          size="small"
          disabled={uploading}
          sx={{
            color: "rgba(100, 116, 139, 0.8)",
            "&:hover": {
              color: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          <Close />
        </IconButton>
      </Paper>

      {/* Asset Details */}
      <TextField
        fullWidth
        label="Asset Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={uploading}
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={uploading}
        multiline
        rows={3}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      <FormControl fullWidth>
        <InputLabel>Source Type</InputLabel>
        <Select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          disabled={uploading}
          label="Source Type"
          sx={{
            borderRadius: "8px",
          }}
        >
          <MenuItem value="3D_MODEL">3D Model</MenuItem>
          <MenuItem value="3D_TILES">3D Tiles</MenuItem>
          <MenuItem value="CAPTURE">Photogrammetry Capture</MenuItem>
        </Select>
      </FormControl>

      {/* Georeferencing (Optional) */}
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "rgba(51, 65, 85, 0.95)",
          mt: 1,
        }}
      >
        Georeferencing (Optional)
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
        <TextField
          size="small"
          label="Longitude"
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          disabled={uploading}
          inputProps={{ step: "0.000001", min: -180, max: 180 }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <TextField
          size="small"
          label="Latitude"
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          disabled={uploading}
          inputProps={{ step: "0.000001", min: -90, max: 90 }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <TextField
          size="small"
          label="Height (m)"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          disabled={uploading}
          inputProps={{ step: "0.1" }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
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
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: "4px",
                backgroundColor: "#2563eb",
              },
            }}
          />
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(100, 116, 139, 0.8)",
              mt: 0.5,
              textAlign: "center",
            }}
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
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: "rgba(100, 116, 139, 0.85)",
            "&:hover": {
              backgroundColor: "rgba(100, 116, 139, 0.08)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!name || uploading}
          startIcon={<Public />}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            backgroundColor: "#2563eb",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
          }}
        >
          Upload to Ion
        </Button>
      </Box>
    </Box>
  );
};

export default UploadToIonTab;
